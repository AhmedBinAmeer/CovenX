import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  LEGAL_REVIEWER = 'LEGAL_REVIEWER',
  CONTRACT_MANAGER = 'CONTRACT_MANAGER',
  FINANCE_APPROVER = 'FINANCE_APPROVER',
  EXECUTIVE = 'EXECUTIVE',
  VIEWER = 'VIEWER'
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  businessUnit: string;
  permissions: string[];
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CONTRACT_MANAGER,
    },
    department: { type: String, default: 'General Legal' },
    businessUnit: { type: String, default: 'Enterprise Solutions' },
    permissions: [{ type: String }],
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
