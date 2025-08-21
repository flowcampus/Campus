import { Router } from 'express';
import prisma from '../lib/prisma';
import emailService from '../services/emailService';

const router = Router();

router.get('/', async (_req, res) => {
  const result: any = { service: 'Campus API' };
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    result.db = 'connected';
  } catch (e: any) {
    result.db = 'disconnected';
    result.dbError = e?.message || String(e);
  }

  try {
    const smtp = await emailService.checkSmtp();
    result.smtp = smtp.ok ? 'verified' : 'failed';
    if (!smtp.ok) {
      result.smtpClassification = smtp.classification;
      result.smtpMessage = smtp.message;
    }
  } catch (e: any) {
    result.smtp = 'failed';
    result.smtpMessage = e?.message || String(e);
  }

  const ok = dbOk; // if DB is fine, API is basically healthy; SMTP can be advisory
  return ok ? res.json({ status: 'ok', ...result }) : res.status(500).json({ status: 'error', ...result });
});

export default router;
