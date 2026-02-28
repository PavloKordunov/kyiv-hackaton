import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { GetOrdersFilterDto } from './dto/getOrdersFilterDto';

@Injectable()
export class OrdersService {
  constructor(private prisma: DatabaseService) {}

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
      this.prisma.order.count({ where })
    ]);
    return {
      data: orders,
      meta:{
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async importCsv(
    fileBuffer: Buffer,
  ): Promise<{ message: string; count: number }> {
    return new Promise((resolve, reject) => {
      const results: any = [];
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
          try {
            const chunkSize = 1000;
            for (let i = 0; i < results.length; i += chunkSize) {
              const chunk = results.slice(i, i + chunkSize);
              await this.processBatch(chunk);
              totalImported += chunk.length;
              console.log(
                `Оброблено батч: ${totalImported} / ${results.length}`,
              );
            }
            resolve({
              message: 'Імпорт успішно завершено',
              count: totalImported,
            });
          } catch (error) {
            console.error('Помилка при збереженні батчу:', error);
            reject(error);
          }
        });
    });
  }

  async generatePdfReport(filter: any): Promise<Buffer> {
    const { county, fromDate, toDate } = filter;

    const baseWhere: Prisma.OrderWhereInput = {};
    if (county && county.length > 0) {
      baseWhere.jurisdictions = { hasSome: county };
    }
    if (fromDate || toDate) {
      baseWhere.timestamp = {};
      if (fromDate) baseWhere.timestamp.gte = new Date(fromDate);
      if (toDate) baseWhere.timestamp.lte = new Date(toDate);
    }

    const validOrdersWhere: Prisma.OrderWhereInput = { ...baseWhere, status: true };
    const outOfStateWhere: Prisma.OrderWhereInput = { ...baseWhere, status: false };

    const [aggregates, outOfStateCount, firstOrder, lastOrder] = await Promise.all([
      this.prisma.order.aggregate({
        where: validOrdersWhere,
        _sum: { subtotal: true, tax_amount: true, total_amount: true },
        _avg: { composite_tax_rate: true, total_amount: true },
        _count: { id: true }
      }),
      this.prisma.order.count({ where: outOfStateWhere }),
      this.prisma.order.findFirst({ where: validOrdersWhere, orderBy: { timestamp: 'asc' } }),
      this.prisma.order.findFirst({ where: validOrdersWhere, orderBy: { timestamp: 'desc' } })
    ]);

    const reportStartDate = fromDate ? new Date(fromDate) : firstOrder?.timestamp;
    const reportEndDate = toDate ? new Date(toDate) : lastOrder?.timestamp;
    const formatDate = (date?: Date) => date ? date.toLocaleDateString('uk-UA') : 'N/A';

    const totalSubtotal = Number(aggregates._sum.subtotal || 0).toFixed(2);
    const totalTax = Number(aggregates._sum.tax_amount || 0).toFixed(2);
    const totalRevenue = Number(aggregates._sum.total_amount || 0).toFixed(2);
    const avgOrderAmount = Number(aggregates._avg.total_amount || 0).toFixed(2);
    const avgTaxRate = (Number(aggregates._avg.composite_tax_rate || 0) * 100).toFixed(3);

    return new Promise((resolve, reject) => {
      try {
        const PDFDocument = require('pdfkit-table');
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        doc.font('Helvetica-Bold').fontSize(22).text('INSTANT WELLNESS KITS');
        doc.font('Helvetica').fontSize(14).fillColor('#666666').text('Sales & Tax Summary Report');
        doc.moveDown(1.5);

        doc.fillColor('black').fontSize(11);
        doc.font('Helvetica-Bold').text('Report Period: ', { continued: true })
           .font('Helvetica').text(`${formatDate(reportStartDate)} — ${formatDate(reportEndDate)}`);
        
        doc.font('Helvetica-Bold').text('Counties: ', { continued: true })
           .font('Helvetica').text(county?.length ? county.join(', ') : 'All New York State');
        
        doc.font('Helvetica-Bold').text('Generated On: ', { continued: true })
           .font('Helvetica').text(new Date().toLocaleString('uk-UA'));
        doc.moveDown(2);

        const table = {
          title: "EXECUTIVE SUMMARY",
          headers: ["Metric", "Value"],
          rows: [
            ["Total Valid Orders", aggregates._count.id.toString()],
            ["Out-of-State Orders (Failed)", outOfStateCount.toString()],
            ["Average Order Amount", `$${avgOrderAmount}`],
            ["Average Tax Rate", `${avgTaxRate}%`],
            ["Total Subtotal", `$${totalSubtotal}`],
            ["Total Tax Collected", `$${totalTax}`],
            ["TOTAL REVENUE", `$${totalRevenue}`],
          ],
        };

        // Малюємо таблицю
        doc.table(table, {
          width: 400,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
          prepareRow: (row) => {
            doc.font("Helvetica").fontSize(11);
            if (row[0] === "TOTAL REVENUE") {
              doc.font("Helvetica-Bold");
            }
          },
        }).then(() => {
          doc.moveDown(2);
          doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666666')
             .text('The average tax rate is calculated dynamically based on spatial GIS data covering the specific delivery coordinates. Out-of-state coordinates (outside NY boundaries) have been excluded from tax collection and are marked as failed.');
          
          doc.end();
        }).catch(err => reject(err));
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private async processBatch(batch: any[]) {
    const jsonBatch = JSON.stringify(batch);

    await this.prisma.$executeRaw`
      WITH input_data AS (
        SELECT * FROM jsonb_to_recordset(${jsonBatch}::jsonb) AS x(
          lon NUMERIC,
          lat NUMERIC,
          subtotal NUMERIC,
          timestamp TIMESTAMP WITH TIME ZONE
        )
      ),
      tax_calc AS (
        SELECT
          i.lon,
          i.lat,
          i.subtotal,
          i.timestamp,
          COALESCE(SUM(t.rate), 0) + 0.04 AS composite_tax_rate,
          
          jsonb_build_object(
            'state_rate', 0.04,
            'county_rate', COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'county'), 0),
            'city_rate', COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'city'), 0),
            'special_rates', COALESCE(SUM(t.rate) FILTER (WHERE t.level = 'special'), 0)
          ) AS breakdown,
          
          array_append(array_remove(array_agg(t.name), NULL), 'New York State') AS jurisdictions
        FROM input_data i
        LEFT JOIN tax_jurisdictions t
          ON ST_Covers(t.geom, ST_SetSRID(ST_MakePoint(i.lon, i.lat), 4326))
        GROUP BY i.lon, i.lat, i.subtotal, i.timestamp
      )

      INSERT INTO orders (subtotal, lat, lon, composite_tax_rate, tax_amount, total_amount, breakdown, jurisdictions, timestamp)
      SELECT
        subtotal,
        lat,
        lon,
        composite_tax_rate,
        (subtotal * composite_tax_rate) AS tax_amount,
        (subtotal + (subtotal * composite_tax_rate)) AS total_amount,
        breakdown,
        jurisdictions,
        timestamp
      FROM tax_calc;
    `;
  }
}
