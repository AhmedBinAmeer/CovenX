import { Schema, model } from 'mongoose';
import crypto from 'node:crypto';

export const OutboxEvent = model('OutboxEvent', new Schema({ eventId: { type: String, unique: true, required: true }, name: { type: String, required: true }, occurredAt: { type: Date, required: true }, tenantId: { type: String, required: true }, actorId: String, entityId: String, requestId: String, payload: Schema.Types.Mixed, status: { type: String, enum: ['pending', 'published', 'failed', 'dead_letter'], default: 'pending' }, attempts: { type: Number, default: 0 }, nextAttemptAt: Date, publishedAt: Date, processedAt: Date, deadLetteredAt: Date, lastError: String }, { timestamps: true }));
OutboxEvent.schema.index({ status: 1, occurredAt: 1 });

export type DomainEventInput = { name: string; tenantId: string; actorId?: string; entityId?: string; requestId?: string; payload: any };
export async function publishEvent(input: DomainEventInput) { return OutboxEvent.create({ ...input, eventId: crypto.randomUUID(), occurredAt: new Date(), nextAttemptAt: new Date(), status: 'pending' }); }
export async function claimPendingEvents(limit = 50) { return OutboxEvent.findOneAndUpdate({ status: 'pending', nextAttemptAt: { $lte: new Date() } }, { $inc: { attempts: 1 } }, { sort: { occurredAt: 1 }, new: true }).limit(limit); }
export async function markEventPublished(eventId: string) { return OutboxEvent.updateOne({ eventId }, { $set: { status: 'published', publishedAt: new Date(), processedAt: new Date() } }); }
export async function markEventFailed(eventId: string, error: string, maxAttempts = 8) { const event: any = await OutboxEvent.findOne({ eventId }); if (!event) return null; const dead = event.attempts >= maxAttempts; const delayMs = Math.min(3600000, 1000 * (2 ** Math.max(0, event.attempts - 1))); return OutboxEvent.updateOne({ eventId }, { $set: { status: dead ? 'dead_letter' : 'pending', lastError: error, nextAttemptAt: new Date(Date.now() + delayMs), ...(dead ? { deadLetteredAt: new Date() } : {}) } }); }
