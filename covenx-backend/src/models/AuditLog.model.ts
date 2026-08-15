import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  contractId?: mongoose.Types.ObjectId;
  contractNumber?: string;
  action: string;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', index: true },
    contractNumber: { type: String },
    action: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
