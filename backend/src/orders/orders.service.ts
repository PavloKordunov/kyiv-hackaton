import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { GetOrdersFilterDto } from './dto/getOrdersFilterDto';

@Injectable()
export class OrdersService {
  constructor(private prisma: DatabaseService) {}

  async getHeatmapData() {
    const result = await this.prisma.$queryRaw`
      WITH county_geoms AS (
        SELECT name, ST_Centroid(ST_Union(geom)) as centroid
        FROM tax_jurisdictions
        WHERE level = 'county'
        GROUP BY name
      ),
      county_stats AS (
        SELECT 
          j_name AS county,
          COUNT(id)::int AS order_count,
          SUM(tax_amount)::float AS total_tax
        FROM orders, unnest(jurisdictions) AS j_name
        WHERE status = true
        GROUP BY j_name
      )
      SELECT 
        cg.name AS county,
        COALESCE(cs.order_count, 0)::int AS order_count,
        COALESCE(cs.total_tax, 0)::float AS total_tax,
        ST_Y(cg.centroid)::float AS lat,
        ST_X(cg.centroid)::float AS lon
      FROM county_geoms cg
      INNER JOIN county_stats cs ON cg.name = cs.county
      WHERE cs.total_tax > 0;
    `;

    return result;
  }

  async getOrders(filter: GetOrdersFilterDto) {
    const { page, limit, county, fromDate, toDate } = filter;

    const where: any = {};

    if (county && county.length > 0) {
      where.jurisdictions = {
        hasSome: county,
      };
    }

    if (fromDate || toDate) {
      where.timestamp = {};

      if (fromDate) {
        where.timestamp.gte = fromDate;
      }
      if (toDate) {
        where.timestamp.lte = toDate;
      }
    }

    const [orders, count] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async importCsv(
    fileBuffer: Buffer,
  ): Promise<{ message: string; count: number; timeTaken: string }> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let totalImported = 0;

      const stream = Readable.from(fileBuffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          if (data.latitude && data.longitude && data.subtotal) {
            results.push({
              lat: parseFloat(data.latitude),
              lon: parseFloat(data.longitude),
              subtotal: parseFloat(data.subtotal),
              timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            });
          }
        })
        .on('end', async () => {
          const startTime = performance.now();

          try {
            const chunkSize = 1000;
            for (let i = 0; i < results.length; i += chunkSize) {
              const chunk = results.slice(i, i + chunkSize);
              const batchStartTime = performance.now();

              await this.processBatch(chunk);
              totalImported += chunk.length;

              const batchEndTime = performance.now();
              console.log(
                `Оброблено батч: ${totalImported} / ${results.length} (${((batchEndTime - batchStartTime) / 1000).toFixed(2)} сек)`,
              );
            }

            const endTime = performance.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

            console.log(
              `Імпорт завершено успішно! Загальний час: ${timeTaken} секунд\n`,
            );

            resolve({
              message: 'Імпорт успішно завершено',
              count: totalImported,
              timeTaken: `${timeTaken} секунд`,
            });
          } catch (error) {
            console.error('Помилка:', error);
            reject(error);
          }
        });
    });
  }

  async generatePdfReport(filter: any): Promise<Buffer> {
    const { county, fromDate, toDate } = filter;
    
    const countiesArray = Array.isArray(county) ? county : (county ? [county] : []);

    const baseWhere: Prisma.OrderWhereInput = {};
    if (countiesArray.length > 0) {
      baseWhere.jurisdictions = { hasSome: countiesArray };
    }
    if (fromDate || toDate) {
      baseWhere.timestamp = {};
      if (fromDate) baseWhere.timestamp.gte = new Date(fromDate);
      if (toDate) baseWhere.timestamp.lte = new Date(toDate);
    }

    const validOrdersWhere: Prisma.OrderWhereInput = { ...baseWhere, status: true };
    const outOfStateWhere: Prisma.OrderWhereInput = { ...baseWhere, status: false };

    const [aggregates, outOfStateAggregates, firstOrder, lastOrder] = await Promise.all([
      this.prisma.order.aggregate({
        where: validOrdersWhere,
        _sum: { subtotal: true, tax_amount: true, total_amount: true },
        _avg: { composite_tax_rate: true, total_amount: true },
        _max: { total_amount: true },
        _count: { id: true }
      }),
      this.prisma.order.aggregate({
        where: outOfStateWhere,
        _count: { id: true },
        _sum: { subtotal: true }
      }),
      this.prisma.order.findFirst({ where: validOrdersWhere, orderBy: { timestamp: 'asc' } }),
      this.prisma.order.findFirst({ where: validOrdersWhere, orderBy: { timestamp: 'desc' } })
    ]);

    const reportStartDate = fromDate ? new Date(fromDate) : firstOrder?.timestamp;
    const reportEndDate = toDate ? new Date(toDate) : lastOrder?.timestamp;
    const formatDate = (date?: Date) => date ? date.toLocaleDateString('uk-UA') : 'N/A';

    const outOfStateCount = outOfStateAggregates._count.id;
    const lostRevenue = Number(outOfStateAggregates._sum.subtotal || 0).toFixed(2);
    const totalSubtotal = Number(aggregates._sum.subtotal || 0).toFixed(2);
    const totalTax = Number(aggregates._sum.tax_amount || 0).toFixed(2);
    const totalRevenue = Number(aggregates._sum.total_amount || 0).toFixed(2);
    const avgOrderAmount = Number(aggregates._avg.total_amount || 0).toFixed(2);
    const maxOrderAmount = Number(aggregates._max.total_amount || 0).toFixed(2);
    const avgTaxRate = (Number(aggregates._avg.composite_tax_rate || 0) * 100).toFixed(3);
    
    const totalOrdersAll = aggregates._count.id + outOfStateCount;
    const successRate = totalOrdersAll > 0 ? ((aggregates._count.id / totalOrdersAll) * 100).toFixed(2) : "0.00";

    let monthlyDatas: any[] = [];
    let showMonthlyTable = false;

    if (reportStartDate && reportEndDate) {
      const startYear = reportStartDate.getFullYear();
      const startMonth = reportStartDate.getMonth();
      const endYear = reportEndDate.getFullYear();
      const endMonth = reportEndDate.getMonth();
      const monthsSpan = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

      if (monthsSpan >= 2) {
        showMonthlyTable = true;
        
        const monthlyOrders = await this.prisma.order.findMany({
          where: baseWhere,
          select: { timestamp: true, total_amount: true, tax_amount: true, status: true }
        });

        const grouped: Record<string, any> = {};
        
        for (const o of monthlyOrders) {
          const monthKey = o.timestamp.toISOString().slice(0, 7);
          
          if (!grouped[monthKey]) {
            grouped[monthKey] = { total: 0, failed: 0, validCount: 0, sum: 0, tax: 0, max: -Infinity };
          }
          
          grouped[monthKey].total++;
          
          if (!o.status) {
            grouped[monthKey].failed++;
          } else {
            const amount = Number(o.total_amount || 0);
            const tax = Number(o.tax_amount || 0);
            
            grouped[monthKey].validCount++;
            grouped[monthKey].sum += amount;
            grouped[monthKey].tax += tax;
            if (amount > grouped[monthKey].max) grouped[monthKey].max = amount;
          }
        }

        const sortedMonths = Object.keys(grouped).sort();
        
        monthlyDatas = sortedMonths.map(monthStr => {
          const stats = grouped[monthStr];
          const avg = stats.validCount > 0 ? (stats.sum / stats.validCount) : 0;
          const max = stats.max === -Infinity ? 0 : stats.max;
          
          const formattedMonthName = new Date(`${monthStr}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          return {
            month: formattedMonthName,
            orders: stats.total.toString(),
            failed: stats.failed.toString(),
            revenue: `$${stats.sum.toFixed(2)}`,
            tax: `$${stats.tax.toFixed(2)}`,
            avg: `$${avg.toFixed(2)}`,
            max: `$${max.toFixed(2)}`
          };
        });
      }
    }

    return new Promise(async (resolve, reject) => {
      try {
        const PDFDocument = require('pdfkit-table');
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        doc.font('Helvetica-Bold').fontSize(22).text('INSTANT WELLNESS KITS');
        doc.font('Helvetica').fontSize(14).fillColor('#666666').text('Sales & Tax Summary Report');
        doc.moveDown(1);

        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor('#cccccc').stroke();
        doc.moveDown(1);

        doc.fillColor('black').fontSize(11);
        doc.font('Helvetica-Bold').text('Report Period: ', { continued: true })
           .font('Helvetica').text(`${formatDate(reportStartDate)} — ${formatDate(reportEndDate)}`);
        
        doc.font('Helvetica-Bold').text('Counties: ', { continued: true })
           .font('Helvetica').text(countiesArray.length ? countiesArray.join(', ') : 'All New York State');
        
        doc.font('Helvetica-Bold').text('Generated On: ', { continued: true })
           .font('Helvetica').text(new Date().toLocaleString('uk-UA'));
        doc.moveDown(1);
        
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor('#cccccc').stroke();
        doc.moveDown(1.5);

        const summaryTable = {
          title: "EXECUTIVE SUMMARY",
          headers: [
            { label: "Metric", property: "metric", width: 270, align: "left" },
            { label: "Value", property: "value", width: 225, align: "left" }
          ],
          datas: [
            { metric: "Total Orders Processed", value: totalOrdersAll.toString() },
            { metric: "Total Valid Orders", value: aggregates._count.id.toString() },
            { metric: "Out-of-State Orders (Failed)", value: outOfStateCount.toString() },
            { metric: "Successful Delivery Rate", value: `${successRate}%` },
            { metric: "Missed Revenue (Out-of-State)", value: `$${lostRevenue}` },
            { metric: "Highest Single Order Value", value: `$${maxOrderAmount}` },
            { metric: "Average Order Amount", value: `$${avgOrderAmount}` },
            { metric: "Average Tax Rate", value: `${avgTaxRate}%` },
            { metric: "Total Subtotal", value: `$${totalSubtotal}` },
            { metric: "Total Tax Owed", value: `$${totalTax}` },
            { metric: "TOTAL REVENUE (Including Tax)", value: `$${totalRevenue}` },
          ],
        };

        await doc.table(summaryTable, {
          width: 495, 
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11).fillColor('black'),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(11);
            
            const metricName = row.metric || row[0];
            
            if (metricName === "TOTAL REVENUE (Including Tax)") {
              doc.font("Helvetica-Bold");
            }
            if (metricName === "Missed Revenue (Out-of-State)" || metricName === "Out-of-State Orders (Failed)") {
              doc.fillColor('#888888');
            } else {
              doc.fillColor('black');
            }
          },
        });

        if (showMonthlyTable && monthlyDatas.length > 0) {
          doc.moveDown(1.5);
          
          const monthlyTableConfig = {
            title: "MONTHLY BREAKDOWN",
            headers: [
              { label: "Month", property: "month", width: 90, align: "left" },
              { label: "Orders", property: "orders", width: 55, align: "center" },
              { label: "Failed", property: "failed", width: 50, align: "center" },
              { label: "Revenue", property: "revenue", width: 75, align: "right" },
              { label: "Tax Owed", property: "tax", width: 75, align: "right" },
              { label: "Avg Price", property: "avg", width: 75, align: "right" },
              { label: "Max Price", property: "max", width: 75, align: "right" },
            ],
            datas: monthlyDatas,
          };

          await doc.table(monthlyTableConfig, {
            width: 495, 
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('black'),
            prepareRow: () => doc.font("Helvetica").fontSize(10).fillColor('black'),
          });
        }

        doc.moveDown(2);
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666666')
           .text('The average tax rate is calculated dynamically based on spatial GIS data covering the specific delivery coordinates. Out-of-state coordinates (outside NY boundaries) have been excluded from tax collection and are marked as failed.');
        
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async createManualOrder(data: { lat: number; lon: number; subtotal: number }) {
    const orderData = {
      lat: Number(data.lat),
      lon: Number(data.lon),
      subtotal: Number(data.subtotal),
      timestamp: new Date(),
    };

    await this.processBatch([orderData]);
    
    return { message: 'Замовлення успішно створено та розраховано' };
  }

  private async processBatch(batch: any[]) {
    const jsonBatch = JSON.stringify(batch);

    await this.prisma.$executeRaw`
      WITH input_data AS (
        SELECT 
          row_number() OVER () AS row_id, 
          lon, lat, subtotal, timestamp
        FROM jsonb_to_recordset(${jsonBatch}::jsonb) AS x(
          lon NUMERIC,
          lat NUMERIC,
          subtotal NUMERIC,
          timestamp TIMESTAMP WITH TIME ZONE
        )
      ),
      raw_aggregates AS (
        SELECT
          i.row_id,
          i.lon,
          i.lat,
          i.subtotal,
          i.timestamp,
          COALESCE(SUM(t.rate), 0) AS local_tax_rate,
          COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'county'), 0) AS county_rate,
          COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'city'), 0) AS city_rate,
          COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'special'), 0) AS special_rate,
          array_remove(array_agg(t.name), NULL) AS local_jurisdictions,
          
          bool_or(t.name IS NOT NULL) AS is_in_ny
          
        FROM input_data i
        LEFT JOIN tax_jurisdictions t
          ON ST_DWithin(t.geom, ST_SetSRID(ST_MakePoint(i.lon, i.lat), 4326), 0.0005)
        GROUP BY i.row_id, i.lon, i.lat, i.subtotal, i.timestamp
      )

      INSERT INTO orders (subtotal, lat, lon, composite_tax_rate, tax_amount, total_amount, breakdown, jurisdictions, timestamp, status)
      SELECT
        subtotal,
        lat,
        lon,
        (local_tax_rate + CASE WHEN is_in_ny THEN 0.04 ELSE 0 END) AS composite_tax_rate,
        (subtotal * (local_tax_rate + CASE WHEN is_in_ny THEN 0.04 ELSE 0 END)) AS tax_amount,
        (subtotal + (subtotal * (local_tax_rate + CASE WHEN is_in_ny THEN 0.04 ELSE 0 END))) AS total_amount,
        
        jsonb_build_object(
          'state_rate', CASE WHEN is_in_ny THEN 0.04 ELSE 0 END,
          'county_rate', county_rate,
          'city_rate', city_rate,
          'special_rates', special_rate
        ) AS breakdown,

        CASE 
          WHEN is_in_ny THEN array_append(local_jurisdictions, 'New York State')
          ELSE ARRAY[]::text[] 
        END AS jurisdictions,

        timestamp, 

        CASE 
          WHEN is_in_ny THEN TRUE
          ELSE FALSE
        END AS status
      FROM raw_aggregates;
    `;
  }
  async GetChartData(){
    const rawData=await this.prisma.$queryRaw<any[]>`
    SELECT 
    DATE(timestamp) AS order_date,
    CAST(COUNT(id) AS INTEGER) AS order_count,
    COALESCE(SUM(tax_amount),0) AS taxes_total
    FROM orders
    WHERE timestamp>=NOW() - INTERVAL '6 days'
     AND status=true
     GROUP BY DATE(timestamp)
     ORDER BY DATE(timestamp) ASC;
    `;
    const daysMap=['Нд', 'Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб'];
    const last7Days:{dateString:string;dayIndex:number}[]=[]
    for(let i=6;i>=0;i--){
      const d=new Date()
      d.setDate(d.getDate()-i)
      const dateString=d.toISOString().split('T')[0]
      last7Days.push({
        dateString,
        dayIndex:d.getDay()
      })
    }
    return last7Days.map((dayInfo)=>{
      const foundData=rawData.find((row)=>{
        const rowDate=new Date(row.order_date).toISOString().split('T')[0]
        return rowDate===dayInfo.dateString;
      })

      return {
        name:daysMap[dayInfo.dayIndex],
        orders:foundData ? Number(foundData.order_count) :0,
        taxes:foundData ? Number(Number(foundData.taxes_total).toFixed(2)):0,
      }
    })
  }

  async getDashBordStats(){
    const ordersStats=await this.prisma.order.aggregate({
      where:{status:true},
      _count:{
        id:true
      },
      _sum:{
        tax_amount:true
      },
      _avg:{
        composite_tax_rate:true,
        total_amount:true
      }
    });
    const taxZonesCount=await this.prisma.taxJurisdiction.count()

    return {
      totalOrders:ordersStats._count.id || 0,
      totalTaxes:Number(ordersStats._sum.tax_amount || 0),
      taxZones:taxZonesCount,
      avgOrderValue:Number(ordersStats._avg.total_amount || 0),
      avgTaxRate:Number(ordersStats._avg.composite_tax_rate || 0)*100
    }
  }
}
