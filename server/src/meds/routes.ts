// server/src/meds/routes.ts

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { verify } from '../auth/service.js';

const r = Router();

/**
 * POST /meds
 * Add a new medication for the authenticated user
 */
r.post('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = verify(token);

    const body = z.object({
      name: z.string(),
      dose: z.number(),
      unit: z.string(),
      route: z.string(),
      schedule: z.any().optional(), // optional in request
      start: z.string(),
      end: z.string().optional(),
      prescriber: z.string().optional()
    }).parse(req.body);

    const med = await prisma.medication.create({
      data: {
        userId,
        name: body.name,
        dose: body.dose,
        unit: body.unit,
        route: body.route,
        schedule: body.schedule ?? {}, // ensure Prisma always gets a value
        start: new Date(body.start),
        end: body.end ? new Date(body.end) : null,
        prescriber: body.prescriber
      }
    });

    res.json(med);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * POST /meds/intake
 * Log a medication intake event
 */
r.post('/intake', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = verify(token);

    const body = z.object({
      medicationId: z.string(),
      takenAt: z.string(),
      dose: z.number().optional(),
      missedReason: z.string().optional()
    }).parse(req.body);

    const med = await prisma.medication.findFirst({
      where: { id: body.medicationId, userId }
    });

    if (!med) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    const rec = await prisma.medicationIntake.create({
      data: {
        medicationId: med.id,
        takenAt: new Date(body.takenAt),
        dose: body.dose,
        missedReason: body.missedReason
      }
    });

    res.json(rec);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * GET /meds
 * Get all medications for the authenticated user
 */
r.get('/', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = verify(token);

    const meds = await prisma.medication.findMany({
      where: { userId },
      include: { intakes: true }
    });

    res.json({ meds });
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

export default r;
