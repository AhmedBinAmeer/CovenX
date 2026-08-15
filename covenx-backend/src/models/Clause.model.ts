import mongoose, { Schema, Document } from 'mongoose';

export interface IClause extends Document {
  title: string;
  category: string;
  body: string;
  isMandatory: boolean;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

const ClauseSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'General Liability' },
    body: { type: String, required: true },
    isMandatory: { type: Boolean, default: false },
    riskRating: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  },
  { timestamps: true }
);

export const ClauseModel = mongoose.model<IClause>('Clause', ClauseSchema);
