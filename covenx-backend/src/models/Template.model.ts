import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  category: string;
  description: string;
  content: string;
  placeholders: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'General' },
    description: { type: String, default: '' },
    content: { type: String, required: true },
    placeholders: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TemplateModel = mongoose.model<ITemplate>('Template', TemplateSchema);
