import { Permission, Role } from '../models/index.js';

const permissionKeys = [
  ['user:read', 'user', 'read', 'tenant'], ['user:create', 'user', 'create', 'tenant'], ['user:update', 'user', 'update', 'tenant'], ['user:manage', 'user', 'manage', 'tenant'],
  ['role:read', 'role', 'read', 'tenant'], ['role:create', 'role', 'create', 'tenant'], ['role:update', 'role', 'update', 'tenant'], ['permission:read', 'permission', 'read', 'tenant'],
  ['contract:read', 'contract', 'read', 'scope'], ['contract:create', 'contract', 'create', 'scope'], ['contract:update', 'contract', 'update', 'scope'], ['contract:submit-review', 'contract', 'submit-review', 'scope'], ['contract:archive', 'contract', 'archive', 'scope'], ['contract:renew', 'contract', 'renew', 'scope'],
  ['contract:history', 'contract', 'history', 'scope'], ['approval:read', 'approval', 'read', 'scope'], ['approval:approve', 'approval', 'approve', 'task'], ['approval:reject', 'approval', 'reject', 'task'], ['approval:delegate', 'approval', 'delegate', 'task'],
  ['document:read', 'document', 'read', 'scope'], ['document:upload', 'document', 'upload', 'scope'], ['document:download', 'document', 'download', 'scope'], ['document:delete', 'document', 'delete', 'scope'], ['audit:read', 'audit', 'read', 'tenant'], ['report:read', 'report', 'read', 'scope']
];

export async function seedRbac(tenantId: string) {
  const permissions = [] as any[];
  for (const [key, resource, action, scopeType] of permissionKeys) permissions.push(await Permission.findOneAndUpdate({ key }, { $setOnInsert: { key, resource, action, scopeType, status: 'active' } }, { upsert: true, new: true }));
  const ids = new Map(permissions.map((p) => [p.key, p._id]));
  const roleSets: Record<string, string[]> = {
    'super-admin': permissionKeys.map(([key]) => key),
    'legal-officer': ['contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'document:read', 'document:upload', 'document:download', 'audit:read'],
    'department-manager': ['contract:read', 'contract:create', 'contract:update', 'contract:submit-review', 'contract:history', 'approval:read', 'approval:approve', 'document:read', 'document:upload', 'document:download', 'report:read'],
    'finance-reviewer': ['contract:read', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'document:read', 'report:read'],
    'executive-approver': ['contract:read', 'contract:history', 'approval:read', 'approval:approve', 'approval:reject', 'report:read'],
    'vendor-user': ['contract:read', 'contract:history', 'approval:read', 'approval:approve', 'document:read', 'document:upload', 'document:download']
  };
  for (const [key, keys] of Object.entries(roleSets)) await Role.findOneAndUpdate({ tenantId, key }, { $set: { name: key.replace('-', ' '), permissionIds: keys.map((p) => ids.get(p)), isSystemRole: true, status: 'active' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
