import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';

export type EmailMessage = { to: string; subject: string; text: string; html?: string; notificationId?: string };
export interface EmailProvider { sendEmail(message: EmailMessage): Promise<{ accepted: boolean; providerMessageId?: string }>; checkHealth(): Promise<boolean>; }

export class MockEmailProvider implements EmailProvider {
  sent: EmailMessage[] = [];
  async sendEmail(message: EmailMessage) {
    this.sent.push(message);
    return { accepted: true, providerMessageId: `mock-${this.sent.length}` };
  }
  async checkHealth() { return true; }
}

export class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const host = config.SMTP_HOST;
      if (!host) throw new Error('EMAIL_NOT_CONFIGURED');
      const port = config.SMTP_PORT ?? 587;
      const user = config.SMTP_USER;
      const pass = config.SMTP_PASSWORD;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });
    }
    return this.transporter;
  }

  async sendEmail(message: EmailMessage) {
    const transporter = this.getTransporter();
    const from = config.SMTP_USER ?? 'covenx.clm@gmail.com';
    const info = await transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { accepted: (info.accepted?.length ?? 0) > 0, providerMessageId: info.messageId };
  }

  async checkHealth() {
    try {
      if (!config.SMTP_HOST) return false;
      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

export const emailProvider: EmailProvider = config.EMAIL_PROVIDER === 'smtp' ? new SmtpEmailProvider() : new MockEmailProvider();
