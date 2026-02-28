import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS tax_jurisdictions_geom_idx 
    ON tax_jurisdictions USING GIST (geom);
  `;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
