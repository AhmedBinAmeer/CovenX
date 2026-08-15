import mongoose, { Schema, Document } from 'mongoose';
import { ContractStatus } from '../types/index.js';

export interface IContract extends Document {
  title: string;
  content: string;
  status: ContractStatus;
  authorId: mongoose.Types.ObjectId;
  value: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(ContractStatus),
      default: ContractStatus.DRAFT,
    },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ContractModel = mongoose.model<IContract>('Contract', ContractSchema);
