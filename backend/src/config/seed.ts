import { Permission, Role } from '../models/index.js';

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
    'legal-officer': ['integration:read', 'intake:read', 'intake:create', 'intake:manage', 'contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'contract:collaborate', 'contract:comment', 'contract:resolve-comment', 'approval:read', 'approval:approve', 'approval:reject', 'signature:request', 'signature:read', 'signature:complete', 'signature:decline', 'document:read', 'document:index', 'document:upload', 'document:download', 'audit:read'],
    'department-manager': ['integration:read', 'intake:read', 'intake:create', 'intake:manage', 'contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'contract:collaborate', 'contract:comment', 'approval:read', 'approval:approve', 'obligation:read', 'obligation:create', 'obligation:update', 'obligation:complete', 'renewal:create', 'document:read', 'document:index', 'document:upload', 'document:download', 'report:read'],
    'finance-reviewer': ['contract:read', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'obligation:read', 'document:read', 'report:read'],
    'executive-approver': ['contract:read', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'report:read'],
    'vendor-user': ['intake:read', 'intake:create', 'contract:read', 'contract:history', 'contract:collaborate', 'contract:comment', 'approval:read', 'approval:approve', 'document:read', 'document:upload', 'document:download']
  };
  for (const [key, keys] of Object.entries(roleSets)) await Role.findOneAndUpdate({ tenantId, key }, { $set: { name: key.replace('-', ' '), permissionIds: keys.map((p) => ids.get(p)), isSystemRole: true, status: 'active' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
