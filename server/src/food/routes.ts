// server/src/food/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { getOrCreateByBarcode, evaluateProsCons, cuisineIdeas } from './service';
import { verify } from '../auth/service';

const r = Router();

// Public: get by barcode (used post-login in app, but kept open for demo)
r.get('/barcode/:code', async (req, res) => {
  try {
    const item = await getOrCreateByBarcode(req.params.code);
    const evals = evaluateProsCons(item);
    res.json({ ...item, pros: evals.pros, cons: evals.cons });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

// Authed: suggestions personalized
r.get('/:id/suggestions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')!;
    const userId = verify(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const item = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!item || !user) return res.status(404).json({ error: 'Not found' });
    const ideas = cuisineIdeas(item, { cuisines: [], allergies: user.allergies || [] });
    res.json({ ideas });
  } catch (e: any) { res.status(401).json({ error: 'Unauthorized' }); }
});

export default r;
