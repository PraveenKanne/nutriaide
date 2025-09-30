// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from './auth/routes.js';
import foodRoutes from './food/routes.js';
import logRoutes from './logs/routes.js';
import medsRoutes from './meds/routes.js';
import doctorRoutes from './doctor/routes.js';
import ocrRoutes from './ocr/routes.js';

export const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/food', foodRoutes);
app.use('/logs', logRoutes);
app.use('/meds', medsRoutes);
app.use('/doctor', doctorRoutes);
app.use('/ocr', ocrRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on :${port}`));
