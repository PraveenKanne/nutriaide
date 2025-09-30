import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { verify } from '../auth/service.js';

const r = Router();

// Create meal log
r.post('/meals', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Missing token');

    const userId = verify(token);
    const body = z.object({
      foodItemId: z.string(),
      grams: z.number().optional(),
      servings: z.number().optional(),
      mealType: z.string(),
      timestamp: z.string(),
      notes: z.string().optional(),
    }).parse(req.body);

    const log = await prisma.mealLog.create({
      data: { userId, ...body, timestamp: new Date(body.timestamp) }
    });
    res.json(log);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get meal logs
r.get('/meals', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Missing token');

    const userId = verify(token);
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 7 * 864e5);
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();

    const logs = await prisma.mealLog.findMany({
      where: { userId, timestamp: { gte: from, lte: to } },
      include: { food: true }
    });
    res.json({ logs });
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

export default r;
