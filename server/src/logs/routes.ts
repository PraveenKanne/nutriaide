// server/src/logs/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { verify } from '../auth/service';

const r = Router();

r.post('/meals', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const body = z.object({
      foodItemId: z.string(),
      grams: z.number().optional(),
      servings: z.number().optional(),
      mealType: z.string(),
      timestamp: z.string(),
      notes: z.string().optional(),
    }).parse(req.body);
    const log = await prisma.mealLog.create({ data: { userId, ...body, timestamp: new Date(body.timestamp) } });
    res.json(log);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.get('/meals', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 7 * 864e5);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const logs = await prisma.mealLog.findMany({
      where: { userId, timestamp: { gte: from, lte: to } },
      include: { food: true }
    });
    res.json({ logs });
  } catch (e: any) { res.status(401).json({ error: 'Unauthorized' }); }
});

r.post('/vitals', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const body = z.object({
      type: z.string(),
      value: z.number(),
      unit: z.string(),
      measuredAt: z.string(),
    }).parse(req.body);
    const v = await prisma.vital.create({ data: { userId, ...body, measuredAt: new Date(body.measuredAt) } });
    res.json(v);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default r;
