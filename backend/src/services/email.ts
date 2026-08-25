export type EmailMessage = { to: string; subject: string; text: string; notificationId?: string };
export interface EmailProvider { sendEmail(message: EmailMessage): Promise<{ accepted: boolean; providerMessageId?: string }>; checkHealth(): Promise<boolean>; }
export class MockEmailProvider implements EmailProvider { sent: EmailMessage[] = []; async sendEmail(message: EmailMessage) { this.sent.push(message); return { accepted: true, providerMessageId: `mock-${this.sent.length}` }; } async checkHealth() { return true; } }
export class SmtpEmailProvider implements EmailProvider { async sendEmail(_message: EmailMessage) { if (!process.env.SMTP_HOST) throw new Error('EMAIL_NOT_CONFIGURED'); return { accepted: false }; } async checkHealth() { return Boolean(process.env.SMTP_HOST); } }
export const emailProvider: EmailProvider = process.env.EMAIL_PROVIDER === 'smtp' ? new SmtpEmailProvider() : new MockEmailProvider();
