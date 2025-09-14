import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { verify } from '../auth/service';
import { generateReport } from './report';

const r = Router();

function hashToken(t: string) {
  return crypto.createHash('sha256').update(t).digest('hex');
}

// Create share link
r.post('/share', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Missing token');

    const userId = verify(token);
    const body = z.object({
      doctorName: z.string().optional(),
      doctorContact: z.string().optional(),
      scopes: z.array(z.string()),
      days: z.number().default(30)
    }).parse(req.body);

    const shareToken = crypto.randomBytes(24).toString('hex');
    const grant = await prisma.shareGrant.create({
      data: {
        userId,
        scopes: body.sc