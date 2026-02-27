import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: DatabaseService) {}

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
}
