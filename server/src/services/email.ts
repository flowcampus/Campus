import nodemailer from 'nodemailer';

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE = 'false', // false for 587 (STARTTLS), true for 465 (SSL)
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === 'true',
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function verifyTransport() {
  return transporter.verify();
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromOverride?: string;
}

export async function sendEmail({ to, subject, html, text, fromOverride }: SendEmailOptions) {
  const from = fromOverride || SMTP_FROM || SMTP_USER || 'no-reply@localhost';
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info;
}
