import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'EXPIRY' | 'APPROVAL' | 'SIGNATURE' | 'OBLIGATION' | 'SYSTEM';
  contractId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['EXPIRY', 'APPROVAL', 'SIGNATURE', 'OBLIGATION', 'SYSTEM'], default: 'SYSTEM' },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
