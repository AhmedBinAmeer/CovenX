import mongoose, { Schema, Document } from 'mongoose';

export enum ContractType {
  NDA = 'NDA',
  SLA = 'SLA',
  MSA = 'MSA',
  PROCUREMENT = 'PROCUREMENT',
  EMPLOYMENT = 'EMPLOYMENT',
  PARTNERSHIP = 'PARTNERSHIP'
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  EXECUTED = 'EXECUTED',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED'
}

export enum SigningStatus {
  UNSIGNED = 'UNSIGNED',
  PARTIALLY_SIGNED = 'PARTIALLY_SIGNED',
  COMPLETELY_SIGNED = 'COMPLETELY_SIGNED'
}

export enum ObligationType {
  PAYMENT = 'PAYMENT',
  SERVICE = 'SERVICE',
  DELIVERABLE = 'DELIVERABLE',
  SLA = 'SLA',
  RENEWAL = 'RENEWAL',
  COMPLIANCE = 'COMPLIANCE'
}

export enum RiskCategory {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IApprovalStep {
  step: number;
  role: string;
  approverId?: mongoose.Types.ObjectId;
  approverName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  decidedAt?: Date;
}

export interface ISignatureRecord {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  status: 'PENDING' | 'SIGNED';
  signedAt?: Date;
  ipAddress?: string;
  signatureHash?: string;
}

export interface IObligation {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: ObligationType;
  ownerName: string;
  dueDate: Date;
  status: 'PENDING' | 'FULFILLED' | 'OVERDUE';
  penaltyClause?: string;
}

export interface IVersionRecord {
  version: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: Date;
  changeSummary: string;
}

export interface IDetectedRisk {
  clauseTitle: string;
  severity: RiskCategory;
  description: string;
  recommendation: string;
}

export interface IContract extends Document {
  contractNumber: string;
  title: string;
  content: string;
  type: ContractType;
  department: string;
  businessUnit: string;
  parties: string[];
  effectiveDate: Date;
  expiryDate: Date;
  value: number;
  currency: string;
  status: ContractStatus;
  version: string;
  versionHistory: IVersionRecord[];
  approvalWorkflow: IApprovalStep[];
  signingStatus: SigningStatus;
  signatureHistory: ISignatureRecord[];
  obligations: IObligation[];
  riskScore: number;
  riskCategory: RiskCategory;
  detectedRisks: IDetectedRisk[];
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema: Schema = new Schema(
  {
    contractNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    type: { type: String, enum: Object.values(ContractType), default: ContractType.MSA },
    department: { type: String, required: true, default: 'Legal & Procurement' },
    businessUnit: { type: String, required: true, default: 'Enterprise' },
    parties: [{ type: String }],
    effectiveDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: Object.values(ContractStatus), default: ContractStatus.DRAFT, index: true },
    version: { type: String, default: '1.0' },
    versionHistory: [
      {
        version: String,
        title: String,
        content: String,
        updatedBy: String,
        updatedAt: { type: Date, default: Date.now },
        changeSummary: String,
      },
    ],
    approvalWorkflow: [
      {
        step: Number,
        role: String,
        approverId: Schema.Types.ObjectId,
        approverName: String,
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        comments: String,
        decidedAt: Date,
      },
    ],
    signingStatus: { type: String, enum: Object.values(SigningStatus), default: SigningStatus.UNSIGNED },
    signatureHistory: [
      {
        signerName: String,
        signerEmail: String,
        signerRole: String,
        status: { type: String, enum: ['PENDING', 'SIGNED'], default: 'PENDING' },
        signedAt: Date,
        ipAddress: String,
        signatureHash: String,
      },
    ],
    obligations: [
      {
        title: String,
        description: String,
        type: { type: String, enum: Object.values(ObligationType) },
        ownerName: String,
        dueDate: Date,
        status: { type: String, enum: ['PENDING', 'FULFILLED', 'OVERDUE'], default: 'PENDING' },
        penaltyClause: String,
      },
    ],
    riskScore: { type: Number, default: 25 },
    riskCategory: { type: String, enum: Object.values(RiskCategory), default: RiskCategory.LOW },
    detectedRisks: [
      {
        clauseTitle: String,
        severity: { type: String, enum: Object.values(RiskCategory) },
        description: String,
        recommendation: String,
      },
    ],
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: 'System Architect' },
  },
  { timestamps: true }
);

export const ContractModel = mongoose.model<IContract>('Contract', ContractSchema);
