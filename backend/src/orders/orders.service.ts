import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: DatabaseService) {}

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
