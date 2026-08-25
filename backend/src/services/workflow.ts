import { ApprovalTask, Contract, Workflow, WorkflowVersion, User } from '../models/index.js';
import { assertTransition } from './lifecycle.js';
import { writeAudit } from './auth.js';
import { publishEvent } from './events.js';

export type WorkflowContext = { contractType?: string; value?: number; departmentId?: string; businessUnitId?: string; riskClassification?: string };

function matchesRule(rule: any, context: WorkflowContext): boolean {
  if (!rule) return true;
  if (rule.contractType && rule.contractType !== context.contractType) return false;
  if (rule.departmentId && rule.departmentId !== context.departmentId) return false;
  if (rule.businessUnitId && rule.businessUnitId !== context.businessUnitId) return false;
  if (rule.riskClassification && rule.riskClassification !== context.riskClassification) return false;
  if (rule.minValue !== undefined && (context.value ?? 0) < Number(rule.minValue)) return false;
  if (rule.maxValue !== undefined && (context.value ?? 0) > Number(rule.maxValue)) return false;
  return true;
}

export function workflowMatches(workflow: any, context: WorkflowContext): boolean { return (workflow.triggerRules ?? []).every((rule: any) => matchesRule(rule, context)); }

export async function selectPublishedWorkflow(contract: any) {
  const candidates = await Workflow.find({ tenantId: contract.tenantId, status: 'published', ...(contract.contractType ? { contractType: contract.contractType } : {}) }).sort({ currentVersion: -1 });
  return candidates.find((workflow: any) => workflowMatches(workflow, { contractType: contract.contractType, value: Number(contract.financial?.value ?? 0), departmentId: String(contract.departmentId ?? ''), businessUnitId: String(contract.businessUnitId ?? ''), riskClassification: contract.risk?.classification })) ?? null;
}

export async function executeWorkflow(contractId: string, actorId: string, requestId?: string) {
  const contract = await Contract.findById(contractId); if (!contract) throw new Error('CONTRACT_NOT_FOUND');
  const workflow: any = await selectPublishedWorkflow(contract);
  if (!workflow) throw new Error('WORKFLOW_NOT_SATISFIED');
  const workflowVersion: any = await WorkflowVersion.findOne({ workflowId: workflow._id, versionNumber: workflow.currentVersion, status: 'published' });
  if (!workflowVersion) throw new Error('WORKFLOW_NOT_SATISFIED');
  const stages = workflowVersion.stages ?? workflow.stages ?? [];
  const tasks = [] as any[];
  for (const [index, stage] of stages.entries()) {
    const assignedUser = stage.assignedUserId ? await User.findOne({ _id: stage.assignedUserId, tenantId: contract.tenantId, status: 'active' }) : await User.findOne({ tenantId: contract.tenantId, status: 'active', ...(stage.assignedRoleId ? { roleIds: stage.assignedRoleId } : {}), ...(stage.departmentId ? { 'organization.departmentId': stage.departmentId } : {}) }).sort({ createdAt: 1 });
    if (!assignedUser && !stage.assignedRoleId && !stage.assignedUserId) throw new Error('WORKFLOW_ASSIGNMENT_INVALID');
    const task = await ApprovalTask.create({ tenantId: contract.tenantId, contractId: contract._id, workflowId: workflow._id, workflowVersionId: workflowVersion._id, stageKey: stage.stageKey ?? `stage-${index + 1}`, assignedUserId: assignedUser?._id ?? undefined, assignedRoleId: stage.assignedRoleId ?? undefined, status: 'pending', dueAt: stage.dueAt ? new Date(stage.dueAt) : new Date(Date.now() + Number(stage.slaHours ?? 72) * 3600000), escalation: { ...(stage.escalation ?? {}), slaHours: Number(stage.slaHours ?? 72), level: 0 }, decision: { quorum: Number(stage.quorum ?? 1) } });
    tasks.push(task);
    await publishEvent({ name: 'ApprovalCreated.v1', tenantId: String(contract.tenantId), actorId, entityId: String(task._id), requestId, payload: { contractId: String(contract._id), workflowId: String(workflow._id), stageKey: task.stageKey } });
  }
  assertTransition('review', 'approval');
  contract.status = 'approval'; contract.version += 1; await contract.save();
  await writeAudit({ tenantId: contract.tenantId, actorId, action: 'workflow.executed', entity: { type: 'contract', id: contract.id }, newValue: { status: 'approval', workflowId: workflow.id }, requestId, result: 'success' });
  return { workflow, workflowVersion, tasks, contract };
}

export async function completeApproval(taskId: string, actorId: string, decision: 'approved' | 'rejected', comment: string | undefined, requestId?: string) {
  const task: any = await ApprovalTask.findOne({ _id: taskId, assignedUserId: actorId, status: { $in: ['pending', 'in_progress', 'delegated'] } });
  if (!task) throw new Error('APPROVAL_NOT_ASSIGNED');
  task.status = decision; task.comments = comment; task.completedAt = new Date(); task.decision = { ...(task.decision ?? {}), decision, actorId, at: task.completedAt }; task.history = [...(task.history ?? []), { action: decision, actorId, comment, at: task.completedAt }]; task.version += 1; await task.save();
  const eventName = decision === 'approved' ? 'ApprovalCompleted.v1' : 'ContractApprovalRejected.v1';
  await publishEvent({ name: eventName, tenantId: String(task.tenantId), actorId, entityId: String(task.contractId), requestId, payload: { approvalTaskId: String(task._id), contractId: String(task.contractId), decision, comment } });
  const contract: any = await Contract.findOne({ _id: task.contractId, tenantId: task.tenantId });
  if (contract && decision === 'rejected') { assertTransition('approval', 'review'); contract.status = 'review'; contract.version += 1; await contract.save(); }
  if (contract && decision === 'approved') { const remaining = await ApprovalTask.countDocuments({ contractId: task.contractId, tenantId: task.tenantId, status: { $in: ['pending', 'in_progress', 'delegated'] } }); if (remaining === 0) { assertTransition('approval', 'signature'); contract.status = 'signature'; contract.version += 1; await contract.save(); await writeAudit({ tenantId: task.tenantId, actorId, action: 'contract.approval_completed', entity: { type: 'contract', id: contract.id }, newValue: { status: 'signature' }, requestId, result: 'success' }); } }
  return task;
}
