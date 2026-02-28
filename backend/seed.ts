import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const TAX_RATES = {
  state: {
    'New York State': 0.04,
  },
  county: {
    Albany: 0.04,
    Allegany: 0.045,
    Broome: 0.04,
    Cattaraugus: 0.04,
    Cayuga: 0.04,
    Chautauqua: 0.04,
    Chemung: 0.04,
    Chenango: 0.04,
    Clinton: 0.04,
    Columbia: 0.04,
    Cortland: 0.04,
    Delaware: 0.04,
    Dutchess: 0.0375,
    Erie: 0.0475,
    Essex: 0.04,
    Franklin: 0.04,
    Fulton: 0.04,
    Genesee: 0.04,
    Greene: 0.04,
    Hamilton: 0.04,
    Herkimer: 0.0425,
    Jefferson: 0.04,
    Lewis: 0.04,
    Livingston: 0.04,
    Madison: 0.04,
    Monroe: 0.04,
    Montgomery: 0.04,
    Nassau: 0.0425,
    Niagara: 0.04,
    Oneida: 0.0475,
    Onondaga: 0.04,
    Ontario: 0.035,
    Orange: 0.0375,
    Orleans: 0.04,
    Oswego: 0.04,
    Otsego: 0.04,
    Putnam: 0.04,
    Rensselaer: 0.04,
    Rockland: 0.04,
    'St Lawrence': 0.04,
    Saratoga: 0.03,
    Schenectady: 0.04,
    Schoharie: 0.04,
    Schuyler: 0.04,
    Seneca: 0.04,
    Steuben: 0.04,
    Suffolk: 0.0425,
    Sullivan: 0.04,
    Tioga: 0.04,
    Tompkins: 0.04,
    Ulster: 0.04,
    Warren: 0.03,
    Washington: 0.03,
    Wayne: 0.04,
    Westchester: 0.04,
    Wyoming: 0.04,
    Yates: 0.04,
    'New York': 0.045,
    Bronx: 0.045,
    Kings: 0.045,
    Queens: 0.045,
    Richmond: 0.045,
  },
  city: {
    Yonkers: 0.045,
    'Mount Vernon': 0.045,
    'New Rochelle': 0.045,
    'White Plains': 0.045,
    Oswego: 0.04,
    Rome: 0.0475,
    Utica: 0.0475,
  },
  special: {
    MCTD: 0.00375,
  },
};

const MCTD_COUNTIES = [
  'New York',
  'Bronx',
  'Kings',
  'Queens',
  'Richmond',
  'Dutchess',
  'Nassau',
  'Orange',
  'Putnam',
  'Rockland',
  'Suffolk',
  'Westchester',
];

async function processGeoJSON(filePath: string) {
  const geojsonRaw = fs.readFileSync(filePath, 'utf-8');
  const geojson = JSON.parse(geojsonRaw);

  let successCount = 0;

  for (const feature of geojson.features) {
    let rawName =
      feature.properties.NAME ||
      feature.properties.MUNI_NAME ||
      feature.properties.name ||
      '';
    let type = feature.properties.MUNI_TYPE || feature.properties.type || '';

    if (!rawName) continue;

    let cleanName = rawName
      .replace(/ County$/i, '')
      .replace(/ City$/i, '')
      .trim();

    if (!type) {
      if (
        Object.keys(TAX_RATES.county).some(
          (k) => k.toLowerCase() === cleanName.toLowerCase(),
        )
      ) {
        type = 'COUNTY';
      } else if (
        Object.keys(TAX_RATES.city).some(
          (k) => k.toLowerCase() === cleanName.toLowerCase(),
        )
      ) {
        type = 'CITY';
      } else {
        continue;
      }
    }

    let level: 'state' | 'county' | 'city' | 'special' | null = null;
    let rate = 0;
    let matchedName = cleanName;

    if (type.toUpperCase() === 'COUNTY') {
      level = 'county';
      const key = Object.keys(TAX_RATES.county).find(
        (k) => k.toLowerCase() === cleanName.toLowerCase(),
      );
      if (key) {
        matchedName = key;
        rate = TAX_RATES.county[key as keyof typeof TAX_RATES.county];
      }
    } else if (type.toUpperCase() === 'CITY') {
      level = 'city';
      const key = Object.keys(TAX_RATES.city).find(
        (k) => k.toLowerCase() === cleanName.toLowerCase(),
      );
      if (key) {
        matchedName = key;
        rate = TAX_RATES.city[key as keyof typeof TAX_RATES.city];
      }
    }

    if (!level || rate === 0) continue;

    const geometryJson = JSON.stringify(feature.geometry);

    try {
      await prisma.$executeRaw`
        INSERT INTO tax_jurisdictions (id, name, level, rate, geom)
        SELECT 
          gen_random_uuid()::text,
          ${matchedName}, 
          ${level}::"JurisdictionLevel", 
          ${rate}, 
          ST_Multi(
            ST_Subdivide(
              ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), 4326)
            )
          )
      `;
      successCount++;

      if (level === 'county' && MCTD_COUNTIES.includes(matchedName)) {
        await prisma.$executeRaw`
          INSERT INTO tax_jurisdictions (id, name, level, rate, geom)
          SELECT 
            gen_random_uuid()::text,
            'MCTD', 
            'special'::"JurisdictionLevel", 
            ${TAX_RATES.special.MCTD}, 
            ST_Multi(
              ST_Subdivide(
                ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), 4326)
              )
            )
        `;
        successCount++;
        console.log(`Додано зону MCTD для ${matchedName}`);
      }
    } catch (error: any) {
      console.error(`Помилка імпорту (${matchedName}):`, error.message);
    }
  }

  console.log(`Завершено обробку ${filePath}. Додано зон: ${successCount}`);
}

async function main() {
  await processGeoJSON('./NYS_Civil_Boundaries_5848232821397896771.geojson');
  await processGeoJSON('./NYS_Civil_Boundaries_-6931323940017030405.geojson');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
