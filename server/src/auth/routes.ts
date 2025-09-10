// server/src/auth/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { login, register, verify } from './service';
import { prisma } from '../index';

const r = Router();

r.post('/register', async (req, res) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() }).parse(req.body);
    const out = await register(body.email, body.password, body.name);
    res.json(out);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.post('/login', async (req, res) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const out = await login(body.email, body.password);
    res.json(out);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')!;
    const userId = verify(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ user });
  } catch (e: any) { res.status(401).json({ error: 'Unauthorized' }); }
});

export default r;
