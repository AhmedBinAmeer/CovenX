import { Permission, Role, IntakeQuestionnaire, Workflow, WorkflowVersion, User } from '../models/index.js';

export async function seedApprovalWorkflow(tenantId: string) {
  // Find the role IDs for legal-officer, finance-reviewer, and executive-approver
  const legalRole = await Role.findOne({ tenantId, key: 'legal-officer', status: 'active' });
  const financeRole = await Role.findOne({ tenantId, key: 'finance-reviewer', status: 'active' });
  const execRole = await Role.findOne({ tenantId, key: 'executive-approver', status: 'active' });

  // Find actual users with those roles (for direct assignedUserId)
  const legalUser = await User.findOne({ tenantId, roleIds: legalRole?._id, status: 'active' });
  const financeUser = await User.findOne({ tenantId, roleIds: financeRole?._id, status: 'active' });
  const execUser = await User.findOne({ tenantId, roleIds: execRole?._id, status: 'active' });

  const stages = [
    { stageKey: 'legal-review', label: 'Legal Review', assignedUserId: legalUser?._id, assignedRoleId: legalRole?._id, slaHours: 72, quorum: 1 },
    { stageKey: 'finance-review', label: 'Finance Review', assignedUserId: financeUser?._id, assignedRoleId: financeRole?._id, slaHours: 48, quorum: 1 },
    { stageKey: 'executive-approval', label: 'Executive Approval', assignedUserId: execUser?._id, assignedRoleId: execRole?._id, slaHours: 48, quorum: 1 },
  ];

  const workflow = await Workflow.findOneAndUpdate(
    { tenantId, key: 'standard-approval' },
    {
      $set: {
        tenantId,
        name: 'Standard Contract Approval',
        key: 'standard-approval',
        status: 'published',
        currentVersion: 1,
        triggerRules: [], // matches ALL contract types
        stages,
        rejectionPolicy: { action: 'return_to_review' },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await WorkflowVersion.findOneAndUpdate(
    { workflowId: workflow._id, versionNumber: 1 },
    {
      $set: {
        tenantId,
        workflowId: workflow._id,
        versionNumber: 1,
        status: 'published',
        stages,
        triggerRules: [],
        rejectionPolicy: { action: 'return_to_review' },
        publishedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return workflow;
}

const permissionKeys = [
  ['user:read', 'user', 'read', 'tenant'], ['user:create', 'user', 'create', 'tenant'], ['user:update', 'user', 'update', 'tenant'], ['user:manage', 'user', 'manage', 'tenant'],
  ['role:read', 'role', 'read', 'tenant'], ['role:create', 'role', 'create', 'tenant'], ['role:update', 'role', 'update', 'tenant'], ['permission:read', 'permission', 'read', 'tenant'],
  ['contract:read', 'contract', 'read', 'scope'], ['contract:create', 'contract', 'create', 'scope'], ['contract:update', 'contract', 'update', 'scope'], ['contract:submit-review', 'contract', 'submit-review', 'scope'], ['contract:archive', 'contract', 'archive', 'scope'], ['contract:renew', 'contract', 'renew', 'scope'],
  ['contract:history', 'contract', 'history', 'scope'], ['contract:collaborate', 'contract', 'collaborate', 'scope'], ['contract:comment', 'contract', 'comment', 'scope'], ['contract:resolve-comment', 'contract', 'resolve-comment', 'scope'], ['signature:request', 'signature', 'request', 'scope'], ['signature:read', 'signature', 'read', 'scope'], ['signature:complete', 'signature', 'complete', 'participant'], ['signature:decline', 'signature', 'decline', 'participant'], ['obligation:read', 'obligation', 'read', 'scope'], ['obligation:create', 'obligation', 'create', 'scope'], ['obligation:update', 'obligation', 'update', 'owner'], ['obligation:complete', 'obligation', 'complete', 'owner'], ['renewal:create', 'renewal', 'create', 'scope'], ['approval:read', 'approval', 'read', 'scope'], ['approval:approve', 'approval', 'approve', 'task'], ['approval:reject', 'approval', 'reject', 'task'], ['approval:delegate', 'approval', 'delegate', 'task'],
  ['document:read', 'document', 'read', 'scope'], ['document:index', 'document', 'index', 'scope'], ['document:upload', 'document', 'upload', 'scope'], ['document:download', 'document', 'download', 'scope'], ['document:delete', 'document', 'delete', 'scope'], ['document:manage', 'document', 'manage', 'tenant'], ['integration:read', 'integration', 'read', 'tenant'], ['integration:create', 'integration', 'create', 'tenant'], ['integration:update', 'integration', 'update', 'tenant'], ['intake:read', 'intake', 'read', 'tenant'], ['intake:create', 'intake', 'create', 'tenant'], ['intake:manage', 'intake', 'manage', 'tenant'], ['audit:read', 'audit', 'read', 'tenant'], ['report:read', 'report', 'read', 'scope']
];

export async function seedRbac(tenantId: string) {
  const permissions = [] as any[];
  for (const [key, resource, action, scopeType] of permissionKeys) permissions.push(await Permission.findOneAndUpdate({ key }, { $setOnInsert: { key, resource, action, scopeType, status: 'active' } }, { upsert: true, new: true }));
  const ids = new Map(permissions.map((p) => [p.key, p._id]));
  const roleSets: Record<string, string[]> = {
    'super-admin': permissionKeys.map(([key]) => key),
    'legal-officer': ['user:read', 'integration:read', 'intake:read', 'intake:create', 'intake:manage', 'contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'contract:collaborate', 'contract:comment', 'contract:resolve-comment', 'approval:read', 'approval:approve', 'approval:reject', 'signature:request', 'signature:read', 'signature:complete', 'signature:decline', 'document:read', 'document:index', 'document:upload', 'document:download', 'audit:read'],
    'department-manager': ['user:read', 'integration:read', 'intake:read', 'intake:create', 'intake:manage', 'contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'contract:collaborate', 'contract:comment', 'contract:resolve-comment', 'approval:read', 'approval:approve', 'obligation:read', 'obligation:create', 'obligation:update', 'obligation:complete', 'renewal:create', 'signature:request', 'signature:read', 'document:read', 'document:index', 'document:upload', 'document:download', 'report:read'],
    'finance-reviewer': ['user:read', 'contract:read', 'contract:history', 'contract:collaborate', 'contract:comment', 'contract:resolve-comment', 'approval:read', 'approval:approve', 'approval:reject', 'obligation:read', 'signature:read', 'document:read', 'report:read'],
    'executive-approver': ['user:read', 'contract:read', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'signature:read', 'signature:complete', 'signature:decline', 'report:read'],
    'vendor-user': ['user:read', 'intake:read', 'intake:create', 'contract:read', 'contract:history', 'contract:collaborate', 'contract:comment', 'contract:resolve-comment', 'approval:read', 'approval:approve', 'signature:read', 'signature:complete', 'signature:decline', 'document:read', 'document:upload', 'document:download']
  };
  for (const [key, keys] of Object.entries(roleSets)) await Role.findOneAndUpdate({ tenantId, key }, { $set: { name: key.replace('-', ' '), permissionIds: keys.map((p) => ids.get(p)), isSystemRole: true, status: 'active' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function seedIntakeQuestionnaires(tenantId: string) {
  const defaultQuestionnaires = [
    {
      contractType: 'service',
      version: 1,
      status: 'published',
      questions: [
        { key: 'counterparty_name', label: 'Counterparty legal entity name', type: 'text', required: true },
        { key: 'estimated_value', label: 'Estimated contract value (USD)', type: 'number', required: true },
        { key: 'business_justification', label: 'Business scope & deliverables summary', type: 'textarea', required: true },
        { key: 'target_start_date', label: 'Target start date', type: 'date', required: false },
      ],
      routingRules: [],
    },
    {
      contractType: 'software_license',
      version: 1,
      status: 'published',
      questions: [
        { key: 'vendor_name', label: 'Software vendor name', type: 'text', required: true },
        { key: 'license_type', label: 'Deployment model', type: 'select', options: ['SaaS / Cloud Subscription', 'On-Premises Perpetual', 'Hybrid'], required: true },
        { key: 'annual_spend', label: 'Annual license fee (USD)', type: 'number', required: true },
        { key: 'data_classification', label: 'Data classification stored/processed', type: 'select', options: ['Public', 'Internal Only', 'Confidential / PII', 'Restricted / Financial'], required: true },
      ],
      routingRules: [],
    },
    {
      contractType: 'nda',
      version: 1,
      status: 'published',
      questions: [
        { key: 'counterparty_name', label: 'Counterparty company name', type: 'text', required: true },
        { key: 'nda_type', label: 'Agreement nature', type: 'select', options: ['Mutual', 'One-Way Disclosing', 'One-Way Receiving'], required: true },
        { key: 'discussion_purpose', label: 'Purpose of confidential discussions', type: 'textarea', required: true },
      ],
      routingRules: [],
    },
    {
      contractType: 'vendor',
      version: 1,
      status: 'published',
      questions: [
        { key: 'vendor_company', label: 'Vendor company name', type: 'text', required: true },
        { key: 'services_summary', label: 'Services / goods to be provided', type: 'textarea', required: true },
        { key: 'budget_allocated', label: 'Allocated budget (USD)', type: 'number', required: true },
      ],
      routingRules: [],
    },
  ];

  for (const q of defaultQuestionnaires) {
    await IntakeQuestionnaire.findOneAndUpdate(
      { tenantId, contractType: q.contractType, status: 'published' },
      { $set: { tenantId, ...q } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}
