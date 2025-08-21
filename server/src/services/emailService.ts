import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private maxRetries = parseInt(process.env.SMTP_MAX_RETRIES || '3', 10);
  private baseDelayMs = parseInt(process.env.SMTP_RETRY_DELAY_MS || '500', 10);
  private lastVerify: { ok: boolean; classification?: string; message?: string } | null = null;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';
    const ignoreTlsErrors = process.env.SMTP_IGNORE_TLS_ERRORS === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      pool: true,
      logger: process.env.SMTP_DEBUG === 'true',
      debug: process.env.SMTP_DEBUG === 'true',
      maxConnections: parseInt(process.env.SMTP_POOL_MAX_CONNECTIONS || '5', 10),
      maxMessages: parseInt(process.env.SMTP_POOL_MAX_MESSAGES || '100', 10),
      connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10),
      greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '10000', 10),
      socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '20000', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: ignoreTlsErrors ? { rejectUnauthorized: false } : undefined,
    } as any);

    // Verify transporter on startup for visibility
    this.transporter
      .verify()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('📧 SMTP transporter verified.', {
          host,
          port,
          secure,
          pool: true,
        });
        this.lastVerify = { ok: true };
      })
      .catch((err) => {
        const classified = this.classifyError(err);
        // eslint-disable-next-line no-console
        console.error('❌ SMTP transporter verification failed:', {
          host,
          port,
          secure,
          user: process.env.SMTP_USER ? '[SET]' : '[MISSING]',
          error: err?.message || err,
          classification: classified,
        });
        this.lastVerify = { ok: false, classification: classified, message: err?.message || String(err) };
      });
  }

  private classifyError(err: any) {
    const message = (err?.message || '').toLowerCase();
    const code = err?.code || '';
    const responseCode = err?.responseCode;
    if (code === 'EAUTH' || message.includes('invalid login')) return 'auth_error';
    if (code === 'ECONNRESET' || code === 'EPIPE') return 'connection_reset';
    if (code === 'ETIMEDOUT' || message.includes('timed out')) return 'timeout';
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'dns_error';
    if (message.includes('self signed certificate') || message.includes('certificate')) return 'tls_error';
    if (responseCode && responseCode >= 500) return 'smtp_server_error';
    return 'unknown_error';
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Campus <noreply@campus.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const start = Date.now();
        const result = await this.transporter.sendMail(mailOptions);
        const duration = Date.now() - start;
        // eslint-disable-next-line no-console
        console.log('📨 Email sent', {
          id: result.messageId,
          to: options.to,
          subject: options.subject,
          response: result.response,
          envelope: result.envelope,
          durationMs: duration,
          attempt,
        });
        return true;
      } catch (err) {
        const classification = this.classifyError(err);
        const isTransient = ['connection_reset', 'timeout', 'dns_error', 'smtp_server_error'].includes(classification);
        // eslint-disable-next-line no-console
        console.error('❌ Email send attempt failed', {
          attempt,
          maxRetries: this.maxRetries,
          to: options.to,
          subject: options.subject,
          error: (err as any)?.message || err,
          code: (err as any)?.code,
          responseCode: (err as any)?.responseCode,
          classification,
        });

        if (attempt < this.maxRetries && isTransient) {
          const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
        return false;
      }
    }
    return false;
  }

  // Lightweight check for health endpoint
  async checkSmtp(): Promise<{ ok: boolean; classification?: string; message?: string }> {
    try {
      // If we recently verified, return cached result
      if (this.lastVerify && this.lastVerify.ok) return this.lastVerify;
      await this.transporter.verify();
      this.lastVerify = { ok: true };
      return this.lastVerify;
    } catch (err: any) {
      const classification = this.classifyError(err);
      const result = { ok: false, classification, message: err?.message || String(err) };
      this.lastVerify = result;
      return result;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>You requested a password reset for your Campus account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Campus School Management System</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Campus Password',
      html,
      text: `Reset your Campus password by visiting: ${resetUrl}`,
    });
  }

  async sendOtpEmail(email: string, code: string, purpose: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Verification Code</h2>
        <p>Your verification code for ${purpose} is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1976d2;">${code}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Campus School Management System</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Campus Verification Code: ${code}`,
      html,
      text: `Your Campus verification code is: ${code}. This code expires in 10 minutes.`,
    });
  }

  async sendMagicLinkEmail(email: string, magicLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Admin Magic Link</h2>
        <p>Click the button below to access the Campus admin portal:</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Access Admin Portal</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${magicLink}</p>
        <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes and can only be used once.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Campus School Management System</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Campus Admin Portal Access',
      html,
      text: `Access the Campus admin portal: ${magicLink}`,
    });
  }
}

export default new EmailService();
