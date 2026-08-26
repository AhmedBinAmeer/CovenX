import { Contract, ContractVersion, CollaborationComment, asId } from '../models/index.js';
import { writeAudit } from './auth.js';
import { publishEvent } from './events.js';

export type RedlineOperation = {
  type: 'insert' | 'delete' | 'replace';
  anchor: { start: number; end?: number; label?: string };
  text?: string;
  before?: string;
  after?: string;
};

function conflict(message: string): never { throw Object.assign(new Error(message), { status: 409 }); }

export function extractText(version: any): string {
  const content = version?.contentRef;
  if (!content) return '';
  if (typeof content === 'string') return content;
  return String(content.text ?? content.plainText ?? content.body ?? '');
}

export function compareText(before: string, after: string) {
  const left = before.split(/\r?\n/);
  const right = after.split(/\r?\n/);
  const blocks: Array<{ type: 'equal' | 'removed' | 'added'; text: string; line: number }> = [];
  let prefix = 0;
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) { blocks.push({ type: 'equal', text: left[prefix], line: prefix + 1 }); prefix += 1; }
  let suffix = 0;
  while (suffix < left.length - prefix && suffix < right.length - prefix && left[left.length - 1 - suffix] === right[right.length - 1 - suffix]) suffix += 1;
  for (let index = prefix; index < left.length - suffix; index += 1) blocks.push({ type: 'removed', text: left[index], line: index + 1 });
  for (let index = prefix; index < right.length - suffix; index += 1) blocks.push({ type: 'added', text: right[index], line: index + 1 });
  for (let index = right.length - suffix; index < right.length; index += 1) blocks.push({ type: 'equal', text: right[index], line: index + 1 });
  return { blocks, summary: { added: blocks.filter((item) => item.type === 'added').length, removed: blocks.filter((item) => item.type === 'removed').length, unchanged: blocks.filter((item) => item.type === 'equal').length } };
}

export async function compareVersions(tenantId: string, contractId: string, fromId: string, toId: string) {
  const versions: any[] = await ContractVersion.find({ tenantId, contractId: asId(contractId), _id: { $in: [asId(fromId), asId(toId)] } });
  const from: any = versions.find((item) => String(item._id) === fromId);
  const to: any = versions.find((item) => String(item._id) === toId);
  if (!from || !to) throw Object.assign(new Error('VERSION_NOT_FOUND'), { status: 404 });
  return { fromVersion: from, toVersion: to, ...compareText(extractText(from), extractText(to)) };
}

export async function createRedline(input: { tenantId: string; contractId: string; actorId: string; baseVersionId: string; expectedContractVersion: number; changeSummary: string; operations: RedlineOperation[]; requestId?: string }) {
  const contract: any = await Contract.findOne({ _id: asId(input.contractId), tenantId: input.tenantId });
  if (!contract) throw Object.assign(new Error('CONTRACT_NOT_FOUND'), { status: 404 });
  if (!['draft', 'review'].includes(contract.status)) conflict('REDLINE_LOCKED_AFTER_EXECUTION');
  if (contract.version !== input.expectedContractVersion) conflict('VERSION_CONFLICT');
  const baseVersion: any = await ContractVersion.findOne({ _id: asId(input.baseVersionId), contractId: contract._id, tenantId: input.tenantId });
  if (!baseVersion) throw Object.assign(new Error('VERSION_NOT_FOUND'), { status: 404 });
  const previous: any = await ContractVersion.findOne({ contractId: contract._id, tenantId: input.tenantId }).sort({ versionNumber: -1 });
  const currentText = extractText(baseVersion);
  const redlineText = input.operations.reduce((text, operation) => {
    const start = Math.max(0, Math.min(operation.anchor.start, text.length));
    const end = Math.max(start, Math.min(operation.anchor.end ?? start, text.length));
    if (operation.type === 'insert') return text.slice(0, start) + (operation.text ?? '') + text.slice(start);
    if (operation.type === 'delete') return text.slice(0, start) + text.slice(end);
    return text.slice(0, start) + (operation.text ?? operation.after ?? '') + text.slice(end);
  }, currentText);
  const version: any = await ContractVersion.create({ tenantId: input.tenantId, contractId: contract._id, versionNumber: (previous?.versionNumber ?? 0) + 1, state: 'draft', authorId: asId(input.actorId), previousVersionId: previous?._id, changeSummary: input.changeSummary, contentRef: { format: 'redline', baseVersionId: baseVersion.id, text: redlineText, operations: input.operations } });
  contract.currentVersionId = version._id;
  contract.version += 1;
  await contract.save();
  await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: 'contract.redline.created', entity: { type: 'contract', id: contract.id }, metadata: { versionId: version.id, baseVersionId: baseVersion.id, operationCount: input.operations.length }, requestId: input.requestId, result: 'success' });
  await publishEvent({ name: 'ContractRedlineCreated.v1', tenantId: input.tenantId, actorId: input.actorId, entityId: contract.id, requestId: input.requestId, payload: { contractId: contract.id, versionId: version.id } });
  return { contract, version };
}

export async function resolveComment(tenantId: string, commentId: string, actorId: string, version: number, requestId?: string) {
  const comment: any = await CollaborationComment.findOne({ _id: asId(commentId), tenantId });
  if (!comment) throw Object.assign(new Error('COMMENT_NOT_FOUND'), { status: 404 });
  if (comment.version !== version) conflict('VERSION_CONFLICT');
  comment.status = 'resolved'; comment.resolvedBy = asId(actorId); comment.resolvedAt = new Date(); comment.version += 1; await comment.save();
  await writeAudit({ tenantId, actorId, action: 'contract.comment.resolved', entity: { type: 'collaborationComment', id: comment.id }, requestId, result: 'success' });
  await publishEvent({ name: 'ContractCommentResolved.v1', tenantId, actorId, entityId: String(comment.contractId), requestId, payload: { commentId: comment.id, contractId: String(comment.contractId) } });
  return comment;
}
