// server/src/doctor/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { verify } from '../auth/service';
import { generateReport } from './report';

const r = Router();

function hashToken(t: string) { return crypto.createHash('sha256').update(t).digest('hex'); }

r.post('/share', async (req, res) => {
  try {
    const userId = verify(req.headers.authorization?.replace('Bearer ', '')!);
    const body = z.object({ doctorName: z.string().optional(), doctorContact: z.string().optional(), scopes: z.array(z.string()), days: z.number().default(30) }).parse(req.body);
    const token = crypto.randomBytes(24).toString('hex');
    const grant = await prisma.shareGrant.create({
      data: {
        userId,
        scopes: body.scopes,
        expiresAt: new Date(Date.now() + body.days * 864e5),
        tokenHash: hashToken(token),
        doctor: body.doctorName ? { create: { name: body.doctorName, contact: body.doctorContact || '' } } : undefined as any
      }
    });
    res.json({ shareUrl: `${process.env.PUBLIC_BASE_URL}/doctor/view/${token}`, expiresAt: grant.expiresAt });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

r.get('/view/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const grant = await prisma.shareGrant.findFirst({ where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } } });
    if (!grant) return res.status(404).json({ error: 'Invalid or expired link' });
    const from = new Date(Date.now() - 30 * 864e5);
    const pdf = await generateReport(grant.userId, from, new Date());
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default r;
