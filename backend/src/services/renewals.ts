import { Contract, ContractVersion } from '../models/index.js';
import { writeAudit } from './auth.js';
import { publishEvent } from './events.js';

export function renewalDue(expiryDate: Date, days = 90, now = new Date()): boolean { return expiryDate.getTime() <= now.getTime() + days * 86400000; }
export async function createRenewal(contractId: string, tenantId: string, actorId: string, targetExpiryDate?: Date, requestId?: string) {
  const source: any = await Contract.findOne({ _id: contractId, tenantId }); if (!source) throw new Error('CONTRACT_NOT_FOUND');
  const existing = await Contract.findOne({ tenantId, 'renewal.sourceContractId': source._id, status: { $in: ['draft', 'review', 'approval', 'signature', 'renewal'] } }); if (existing) return existing;
  const renewal: any = await Contract.create({ tenantId, contractNumber: `${source.contractNumber}-R${Date.now()}`, title: source.title, contractType: source.contractType, parties: source.parties, ownerId: source.ownerId, departmentId: source.departmentId, businessUnitId: source.businessUnitId, status: 'renewal', effectiveDate: new Date(), expiryDate: targetExpiryDate, financial: source.financial, risk: source.risk, tags: source.tags, metadata: source.metadata, renewal: { sourceContractId: source._id, sourceVersionId: source.currentVersionId, targetExpiryDate } });
  const version: any = await ContractVersion.create({ tenantId, contractId: renewal._id, versionNumber: 1, state: 'draft', authorId: actorId, previousVersionId: source.currentVersionId, changeSummary: 'Renewal draft created' }); renewal.currentVersionId = version._id; await renewal.save();
  await writeAudit({ tenantId, actorId, action: 'renewal.created', entity: { type: 'contract', id: renewal.id }, metadata: { sourceContractId: source.id }, requestId, result: 'success' });
  await publishEvent({ name: 'RenewalCreated.v1', tenantId, actorId, entityId: renewal.id, requestId, payload: { sourceContractId: source.id, renewalContractId: renewal.id } });
  return renewal;
}
export async function findRenewalsDue(tenantId: string, days = 90) { const cutoff = new Date(Date.now() + days * 86400000); return Contract.find({ tenantId, status: { $in: ['active', 'monitoring'] }, expiryDate: { $lte: cutoff, $gte: new Date() } }).sort({ expiryDate: 1 }); }
export async function emitRenewalDue(contract: any, actorId = 'system') { return publishEvent({ name: 'RenewalDue.v1', tenantId: String(contract.tenantId), actorId, entityId: String(contract._id), payload: { contractId: String(contract._id), expiryDate: contract.expiryDate } }); }
