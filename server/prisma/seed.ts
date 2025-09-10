// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Seeding minimal data...');
}
main().finally(() => prisma.$disconnect());
