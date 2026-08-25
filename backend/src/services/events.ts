import { Schema, model } from 'mongoose';
import crypto from 'node:crypto';

export const OutboxEvent = model('OutboxEvent', new Schema({ eventId: { type: String, unique: true, required: true }, name: { type: String, required: true }, occurredAt: { type: Date, required: true }, tenantId: { type: String, required: true }, actorId: String, entityId: String, requestId: String, payload: Schema.Types.Mixed, status: { type: String, enum: ['pending', 'published', 'failed'], default: 'pending' }, attempts: { type: Number, default: 0 }, publishedAt: Date, lastError: String }, { timestamps: true }));
OutboxEvent.schema.index({ status: 1, occurredAt: 1 });

export type DomainEventInput = { name: string; tenantId: string; actorId?: string; entityId?: string; requestId?: string; payload: any };
export async function publishEvent(input: DomainEventInput) { return OutboxEvent.create({ ...input, eventId: crypto.randomUUID(), occurredAt: new Date(), status: 'pending' }); }
