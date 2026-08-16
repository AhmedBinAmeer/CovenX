import { ContractRepository } from '../repositories/contract.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { IContract, ContractStatus, SigningStatus, RiskCategory, ContractType } from '../models/Contract.model';
import crypto from 'crypto';

export class ContractService {
  private contractRepository: ContractRepository;
  private auditRepository: AuditRepository;

  constructor() {
    this.contractRepository = new ContractRepository();
    this.auditRepository = new AuditRepository();
  }

  private async invalidateAnalyticsCache() {
    try {
      const redis = (await import('../config/redis')).getRedisClient();
      if (redis && redis.isOpen) {
        await redis.del('covenx:analytics:dashboard');
      }
    } catch (err) {}
  }

  private generateContractNumber(type: string): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CVX-${type}-${new Date().getFullYear()}-${randomHex}`;
  }

  private calculateRiskScore(content: string, value: number): { score: number; category: RiskCategory; risks: any[] } {
    let score = 20;
    const risks: any[] = [];

    if (value > 500000) {
      score += 25;
      risks.push({
        clauseTitle: 'High Financial Exposure',
        severity: RiskCategory.HIGH,
        description: `Contract value of $${value.toLocaleString()} exceeds high-risk threshold.`,
        recommendation: 'Requires CFO and Executive board approval.',
      });
    }

    const lowContent = content.toLowerCase();

    if (!lowContent.includes('indemnif') && !lowContent.includes('hold harmless')) {
      score += 20;
      risks.push({
        clauseTitle: 'Missing Indemnification',
        severity: RiskCategory.MEDIUM,
        description: 'No explicit hold-harmless or indemnification clause detected.',
        recommendation: 'Insert Standard Indemnity Clause from Clause Library.',
      });
    }

    if (lowContent.includes('unlimited liability')) {
      score += 35;
      risks.push({
        clauseTitle: 'Unlimited Liability Clause',
        severity: RiskCategory.CRITICAL,
        description: 'Contains unlimited liability terms increasing risk exposure.',
        recommendation: 'Cap total liability to 1x contract value.',
      });
    }

    let category = RiskCategory.LOW;
    if (score >= 75) category = RiskCategory.CRITICAL;
    else if (score >= 50) category = RiskCategory.HIGH;
    else if (score >= 35) category = RiskCategory.MEDIUM;

    return { score: Math.min(score, 100), category, risks };
  }

  async createContract(data: {
    title: string;
    content: string;
    type?: ContractType;
    department?: string;
    businessUnit?: string;
    parties?: string[];
    value?: number;
    expiryDate?: Date;
    authorId: string;
    authorName?: string;
  }): Promise<IContract> {
    const contractNumber = this.generateContractNumber(data.type || 'MSA');
    const expiry = data.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const riskEval = this.calculateRiskScore(data.content, data.value || 0);

    const contract = await this.contractRepository.create({
      contractNumber,
      title: data.title,
      content: data.content,
      type: data.type || ContractType.MSA,
      department: data.department || 'Legal & Procurement',
      businessUnit: data.businessUnit || 'Enterprise',
      parties: data.parties || ['CovenX Inc.', 'Client Corp'],
      value: data.value || 100000,
      expiryDate: expiry,
      status: ContractStatus.DRAFT,
      version: '1.0',
      versionHistory: [
        {
          version: '1.0',
          title: data.title,
          content: data.content,
          updatedBy: data.authorName || 'System Architect',
          updatedAt: new Date(),
          changeSummary: 'Initial Draft Created',
        },
      ],
      approvalWorkflow: [
        { step: 1, role: 'LEGAL_REVIEWER', status: 'PENDING' },
        { step: 2, role: 'FINANCE_APPROVER', status: 'PENDING' },
        { step: 3, role: 'EXECUTIVE', status: 'PENDING' },
      ],
      signingStatus: SigningStatus.UNSIGNED,
      signatureHistory: [
        { signerName: 'Internal Executive', signerEmail: 'executive@covenx.io', signerRole: 'Vendor Executive', status: 'PENDING' },
        { signerName: 'Client Authorized Representative', signerEmail: 'client@clientcorp.com', signerRole: 'Client Rep', status: 'PENDING' },
      ],
      obligations: [
        {
          title: 'SLA Uptime Compliance Check',
          description: 'Quarterly audit of 99.99% system availability.',
          type: 'SLA' as any,
          ownerName: 'DevOps Lead',
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
        },
      ],
      riskScore: riskEval.score,
      riskCategory: riskEval.category,
      detectedRisks: riskEval.risks,
      authorId: data.authorId as any,
      authorName: data.authorName || 'System Architect',
    });

    await this.auditRepository.create({
      contractId: contract._id as any,
      contractNumber: contract.contractNumber,
      action: 'CONTRACT_CREATED',
      actorId: data.authorId as any,
      actorName: data.authorName || 'System Architect',
      actorRole: 'CONTRACT_MANAGER',
      details: `Created draft contract ${contract.contractNumber} (${contract.title})`,
    });

    await this.invalidateAnalyticsCache();
    return contract;
  }

  async getContractById(id: string): Promise<IContract | null> {
    return await this.contractRepository.findById(id);
  }

  async listContracts(filters: { status?: string; type?: string; department?: string; search?: string }): Promise<IContract[]> {
    return await this.contractRepository.findWithFilters(filters);
  }

  async updateContentAndVersion(
    id: string,
    title: string,
    content: string,
    updatedBy: string,
    actorId: string,
    changeSummary: string
  ): Promise<IContract | null> {
    const existing = await this.contractRepository.findById(id);
    if (!existing) return null;

    const currentVerNum = parseFloat(existing.version || '1.0');
    const newVersion = (currentVerNum + 0.1).toFixed(1);
    const riskEval = this.calculateRiskScore(content, existing.value);

    const updatedHistory = [
      ...existing.versionHistory,
      {
        version: newVersion,
        title,
        content,
        updatedBy,
        updatedAt: new Date(),
        changeSummary: changeSummary || `Updated content to version ${newVersion}`,
      },
    ];

    const updated = await this.contractRepository.update(id, {
      title,
      content,
      version: newVersion,
      versionHistory: updatedHistory,
      riskScore: riskEval.score,
      riskCategory: riskEval.category,
      detectedRisks: riskEval.risks,
    });

    await this.auditRepository.create({
      contractId: existing._id as any,
      contractNumber: existing.contractNumber,
      action: 'VERSION_UPDATED',
      actorId: actorId as any,
      actorName: updatedBy,
      actorRole: 'CONTRACT_MANAGER',
      details: `Bumped version to ${newVersion}: ${changeSummary || 'Content modification'}`,
    });

    await this.invalidateAnalyticsCache();
    return updated;
  }

  async submitForApproval(id: string, actorId: string, actorName: string): Promise<IContract | null> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) return null;

    const updated = await this.contractRepository.update(id, {
      status: ContractStatus.PENDING_REVIEW,
    });

    await this.auditRepository.create({
      contractId: contract._id as any,
      contractNumber: contract.contractNumber,
      action: 'SUBMITTED_FOR_APPROVAL',
      actorId: actorId as any,
      actorName,
      actorRole: 'CONTRACT_MANAGER',
      details: 'Submitted contract for multi-level review & approval',
    });

    await this.invalidateAnalyticsCache();
    return updated;
  }

  async approveStep(
    id: string,
    step: number,
    approverId: string,
    approverName: string,
    role: string,
    comments?: string
  ): Promise<IContract | null> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) return null;

    const workflow = [...contract.approvalWorkflow];
    const targetStep = workflow.find((s) => s.step === step);
    if (targetStep) {
      targetStep.status = 'APPROVED';
      targetStep.approverId = approverId as any;
      targetStep.approverName = approverName;
      targetStep.comments = comments || 'Approved without reservations.';
      targetStep.decidedAt = new Date();
    }

    const allApproved = workflow.every((s) => s.status === 'APPROVED');
    const newStatus = allApproved ? ContractStatus.APPROVED : ContractStatus.PENDING_REVIEW;

    const updated = await this.contractRepository.update(id, {
      approvalWorkflow: workflow,
      status: newStatus,
    });

    await this.auditRepository.create({
      contractId: contract._id as any,
      contractNumber: contract.contractNumber,
      action: 'STEP_APPROVED',
      actorId: approverId as any,
      actorName: approverName,
      actorRole: role,
      details: `Step ${step} (${role}) approved. ${allApproved ? 'Contract Fully Approved.' : 'Pending remaining approvals.'}`,
    });

    await this.invalidateAnalyticsCache();
    return updated;
  }

  async simulateDigitalSignature(
    id: string,
    signerName: string,
    signerEmail: string,
    actorId: string
  ): Promise<IContract | null> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) return null;

    const sigHash = crypto.createHash('sha256').update(`${id}-${signerEmail}-${Date.now()}`).digest('hex');

    const history = [...contract.signatureHistory];
    const targetSig = history.find((s) => s.signerEmail.toLowerCase() === signerEmail.toLowerCase()) || history[0];

    if (targetSig) {
      targetSig.status = 'SIGNED';
      targetSig.signedAt = new Date();
      targetSig.signatureHash = sigHash;
      targetSig.ipAddress = '192.168.1.100';
    }

    const signedCount = history.filter((s) => s.status === 'SIGNED').length;
    let newSigningStatus = SigningStatus.PARTIALLY_SIGNED;
    let newContractStatus = contract.status;

    if (signedCount >= history.length) {
      newSigningStatus = SigningStatus.COMPLETELY_SIGNED;
      newContractStatus = ContractStatus.EXECUTED;
    }

    const updated = await this.contractRepository.update(id, {
      signatureHistory: history,
      signingStatus: newSigningStatus,
      status: newContractStatus,
    });

    await this.auditRepository.create({
      contractId: contract._id as any,
      contractNumber: contract.contractNumber,
      action: 'DIGITAL_SIGNATURE_EXECUTED',
      actorId: actorId as any,
      actorName: signerName,
      actorRole: 'SIGNER',
      details: `Digital signature generated by ${signerName} (${signerEmail}). Hash: ${sigHash.substring(0, 12)}...`,
    });

    await this.invalidateAnalyticsCache();
    return updated;
  }

  async addObligation(id: string, obligationData: any, actorId: string, actorName: string): Promise<IContract | null> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) return null;

    const obligations = [...contract.obligations, obligationData];
    const updated = await this.contractRepository.update(id, { obligations });

    await this.auditRepository.create({
      contractId: contract._id as any,
      contractNumber: contract.contractNumber,
      action: 'OBLIGATION_ADDED',
      actorId: actorId as any,
      actorName,
      actorRole: 'CONTRACT_MANAGER',
      details: `Added new obligation: ${obligationData.title} (Owner: ${obligationData.ownerName})`,
    });

    return updated;
  }
}
