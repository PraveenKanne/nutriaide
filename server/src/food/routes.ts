import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { getOrCreateByBarcode, evaluateProsCons, cuisineIdeas } from './service';
import { verify } from '../auth/service.js';

const r = Router();

// Public: Get food by barcode
r.get('/barcode/:code', async (req: Request, res: Response) => {
  try {
    const item = await getOrCreateByBarcode(req.params.code);
    const evals = evaluateProsCons(item);
    res.json({ ...item, pros: evals.pros, cons: evals.cons });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// Authed: Get cuisine suggestions
r.get('/:id/suggestions', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Missing token');

    const userId = verify(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const item = await prisma.foodItem.findUnique({ where: { id: req.params.id } });

    if (!item || !user) return res.status(404).json({ error: 'Not found' });

    const ideas = cuisineIdeas(item, { cuisines: [], allergies: user.allergies || [] });
    res.json({ ideas });
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

export default r;
