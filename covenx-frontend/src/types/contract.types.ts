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

export enum RiskCategory {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IApprovalStep {
  step: number;
  role: string;
  approverId?: string;
  approverName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  decidedAt?: string;
}

export interface ISignatureRecord {
  signerName: string;
  signerEmail: string;
  signerRole: string;
  status: 'PENDING' | 'SIGNED';
  signedAt?: string;
  ipAddress?: string;
  signatureHash?: string;
}

export interface IObligation {
  _id?: string;
  title: string;
  description?: string;
  type: 'PAYMENT' | 'SERVICE' | 'DELIVERABLE' | 'SLA' | 'RENEWAL' | 'COMPLIANCE';
  ownerName: string;
  dueDate: string;
  status: 'PENDING' | 'FULFILLED' | 'OVERDUE';
  penaltyClause?: string;
}

export interface IVersionRecord {
  version: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
  changeSummary: string;
}

export interface IDetectedRisk {
  clauseTitle: string;
  severity: RiskCategory;
  description: string;
  recommendation: string;
}

export interface IContract {
  _id: string;
  contractNumber: string;
  title: string;
  content: string;
  type: ContractType;
  department: string;
  businessUnit: string;
  parties: string[];
  effectiveDate: string;
  expiryDate: string;
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
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITemplate {
  _id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  placeholders: string[];
  isActive: boolean;
}

export interface IClause {
  _id: string;
  title: string;
  category: string;
  body: string;
  isMandatory: boolean;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IAuditLog {
  _id: string;
  contractId?: string;
  contractNumber?: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ExecutiveMetrics {
  totalContracts: number;
  activeContracts: number;
  pendingApprovals: number;
  draftContracts: number;
  expiringSoon: number;
  totalContractValue: number;
  departmentBreakdown: { _id: string; count: number; totalValue: number }[];
  statusBreakdown: { _id: string; count: number }[];
  recentActivity: IAuditLog[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: string | null;
}
