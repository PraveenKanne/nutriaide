// server/src/doctor/report.ts
import PDFDocument from 'pdfkit';
import { prisma } from '../index';

export async function generateReport(userId: string, from: Date, to: Date): Promise<Buffer> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const meals = await prisma.mealLog.findMany({ where: { userId, timestamp: { gte: from, lte: to } }, include: { food: true } });
  const meds = await prisma.medication.findMany({ where: { userId }, include: { intakes: true } });
  const vitals = await prisma.vital.findMany({ where: { userId, measuredAt: { gte: from, lte: to } } });

  const doc = new PDFDocument({ margin: 40 });
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(18).text('Nutrition & Health Report', { underline: true });
  doc.moveDown().fontSize(12).text(`Patient: ${user?.name || user?.email}`);
  doc.text(`Period: ${from.toDateString()} - ${to.toDateString()}`);
  doc.moveDown().fontSize(14).text('Meal Summary');
  meals.slice(0, 200).forEach(m => {
    doc.fontSize(10).text(`${m.timestamp.toISOString()} — ${m.mealType} — ${m.food.name} — ${m.grams ?? m.servings ?? ''}`);
  });
  doc.moveDown().fontSize(14).text('Medications');
  meds.forEach(m => doc.fontSize(10).text(`${m.name} ${m.dose}${m.unit} ${m.route}`));
  doc.moveDown().fontSize(14).text('Vitals');
  vitals.forEach(v => doc.fontSize(10).text(`${v.measuredAt.toISOString()} — ${v.type}: ${v.value} ${v.unit}`));

  doc.end();
  return await new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(buffers))));
}
