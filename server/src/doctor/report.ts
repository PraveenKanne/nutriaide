// server/src/doctor/routes.ts

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { verify } from '../auth/service';
import { generateReport } from './report';

const r = Router();

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /doctor/share
 * Creates a secure, time‑limited share link for a doctor to view a patient's report.
 */
r.post('/share', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
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
        scopes: body.scopes,
        expiresAt: new Date(Date.now() + body.days * 864e5),
        tokenHash: hashToken(shareToken),
        doctor: body.doctorName
          ? {
              create: {
                name: body.doctorName,
                contact: body.doctorContact || ''
              }
            }
          : undefined
      }
    });

    res.json({
      shareUrl: `${process.env.PUBLIC_BASE_URL}/doctor/view/${shareToken}`,
      expiresAt: grant.expiresAt
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * GET /doctor/view/:token
 * Allows a doctor (with a valid share token) to download the patient's PDF report.
 */
r.get('/view/:token', async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const grant = await prisma.shareGrant.findFirst({
      where: {
        tokenHash: hashToken(token),
        expiresAt: { gt: new Date() }
      }
    });

    if (!grant) return res.status(404).json({ error: 'Invalid or expired link' });

    // Default to last 30 days
    const from = new Date(Date.now() - 30 * 864e5);
    const to = new Date();

    const pdfBuffer = await generateReport(grant.userId, from, to);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    res.send(pdfBuffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
