import { Contract, SignatureParticipant, SignatureRequest } from '../models/index.js';
import { writeAudit } from './auth.js';
import { publishEvent } from './events.js';
import { assertTransition } from './lifecycle.js';

export async function requestSignature(contractId: string, tenantId: string, actorId: string, provider: string, signers: any[], contractVersionId: string, expiresAt: Date, requestId?: string) {
  const contract: any = await Contract.findOne({ _id: contractId, tenantId });
  if (!contract || contract.status !== 'signature') throw new Error('SIGNATURE_CONTRACT_NOT_READY');
  if (String(contract.currentVersionId) !== String(contractVersionId)) throw new Error('VERSION_CONFLICT');
  if (!signers.length) throw new Error('SIGNERS_REQUIRED');
  const request: any = await SignatureRequest.create({ tenantId, contractId, contractVersionId, provider, signers, expiresAt, createdBy: actorId, status: 'requested' });
  await SignatureParticipant.insertMany(signers.map((signer, index) => ({ tenantId, signatureRequestId: request._id, userId: signer.userId, vendorIdentity: signer.vendorIdentity, signingOrder: signer.signingOrder ?? index + 1, status: 'pending' })));
  await writeAudit({ tenantId, actorId, action: 'signature.requested', entity: { type: 'signatureRequest', id: request.id }, newValue: { contractId, contractVersionId }, requestId, result: 'success' });
  await publishEvent({ name: 'ContractSignatureRequested.v1', tenantId, actorId, entityId: request.id, requestId, payload: { contractId, contractVersionId, signatureRequestId: request.id } });
  return request;
}

export async function completeSignature(requestId: string, tenantId: string, actorId: string, evidenceRefs: any[], requestIdHeader?: string) {
  const request: any = await SignatureRequest.findOne({ _id: requestId, tenantId }); if (!request) throw new Error('SIGNATURE_NOT_FOUND');
  const participant: any = await SignatureParticipant.findOne({ signatureRequestId: request._id, tenantId, userId: actorId, status: 'pending' }); if (!participant) throw new Error('SIGNER_NOT_AUTHORIZED');
  participant.status = 'signed'; participant.signedAt = new Date(); participant.evidenceRefs = evidenceRefs; await participant.save();
  const remaining = await SignatureParticipant.countDocuments({ signatureRequestId: request._id, tenantId, status: 'pending' });
  if (remaining === 0) { request.status = 'completed'; request.completedAt = new Date(); request.evidenceRefs = evidenceRefs; await request.save(); const contract: any = await Contract.findOne({ _id: request.contractId, tenantId }); if (contract) { assertTransition('signature', 'active'); contract.status = 'active'; contract.version += 1; await contract.save(); } }
  await writeAudit({ tenantId, actorId, action: 'signature.completed', entity: { type: 'signatureRequest', id: request.id }, metadata: { participantId: participant.id }, requestId: requestIdHeader, result: 'success' });
  await publishEvent({ name: 'SignatureCompleted.v1', tenantId, actorId, entityId: request.id, requestId: requestIdHeader, payload: { contractId: String(request.contractId), signatureRequestId: request.id, participantId: participant.id, remaining } });
  return request;
}

export async function declineSignature(requestId: string, tenantId: string, actorId: string, reason: string, requestIdHeader?: string) {
  const request: any = await SignatureRequest.findOne({ _id: requestId, tenantId }); if (!request) throw new Error('SIGNATURE_NOT_FOUND');
  const participant: any = await SignatureParticipant.findOne({ signatureRequestId: request._id, tenantId, userId: actorId, status: 'pending' }); if (!participant) throw new Error('SIGNER_NOT_AUTHORIZED');
  participant.status = 'declined'; participant.declineReason = reason; await participant.save(); request.status = 'declined'; request.auditMetadata = { declineReason: reason, declinedBy: actorId }; await request.save();
  const contract: any = await Contract.findOne({ _id: request.contractId, tenantId }); if (contract) { contract.status = 'approval'; contract.version += 1; await contract.save(); }
  await writeAudit({ tenantId, actorId, action: 'signature.declined', entity: { type: 'signatureRequest', id: request.id }, newValue: { reason }, requestId: requestIdHeader, result: 'success' });
  await publishEvent({ name: 'SignatureDeclined.v1', tenantId, actorId, entityId: request.id, requestId: requestIdHeader, payload: { contractId: String(request.contractId), signatureRequestId: request.id, reason } });
  return request;
}
