// server/src/meds/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { verify } from '../auth/service';

const r = Router();

r.post('/', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const body = z.object({
      name: z.string(), dose: z.number(), unit: z.string(),
      route: z.string(), schedule: z.any(), start: z.string(), end: z.string().optional(), prescriber: z.string().optional()
    }).parse(req.body);
    const med = await prisma.medication.create({
      data: { userId, ...body, start: new Date(body.start), end: body.end ? new Date(body.end) : null }
    });
    res.json(med);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.post('/intake', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const body = z.object({ medicationId: z.string(), takenAt: z.string(), dose: z.number().optional(), missedReason: z.string().optional() }).parse(req.body);
    const med = await prisma.medication.findFirst({ where: { id: body.medicationId, userId } });
    if (!med) return res.status(404).json({ error: 'Medication not found' });
    const rec = await prisma.medicationIntake.create({ data: { medicationId: med.id, takenAt: new Date(body.takenAt), dose: body.dose, missedReason: body.missedReason } });
    res.json(rec);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.get('/', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const meds = await prisma.medication.findMany({ where: { userId }, include: { intakes: true } });
    res.json({ meds });
  } catch (e: any) { res.status(401).json({ error: 'Unauthorized' }); }
});

export default r;
