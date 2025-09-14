import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { login, register, verify } from './service';
import { prisma } from '../index';

const r = Router();

// Register
r.post('/register', async (req: Request, res: Response) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional()
    }).parse(req.body);

    const out = await register(body.email, body.password, body.name);
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Login
r.post('/login', async (req: Request, res: Response) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

    const out = await login(body.email, body.password);
    res.json(out);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get current user
r.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Missing token');

    const userId = verify(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ user });
  } catch (e: any) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default r;
