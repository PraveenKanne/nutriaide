// server/src/ocr/routes.ts
import { Router } from 'express';
import { createWorker } from 'tesseract.js';

const r = Router();
let worker: any;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng'); // English OCR; add languages as needed
  }
  return worker;
}

r.post('/label', async (req, res) => {
  try {
    const { imageBase64 } = req.body as { imageBase64: string };
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    const w = await getWorker();
    const img = Buffer.from(imageBase64, 'base64');
    const { data } = await w.recognize(img);
    res.json({ text: data.text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default r;
