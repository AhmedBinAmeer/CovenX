import mongoose from 'mongoose';
import { User, Role, Permission, ApprovalTask, Contract, Organization } from '../src/models/index.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  
  const victor = await User.findOne({ email: 'vendor@demo.covenx.com' });
  console.log('VICTOR USER:', victor ? { id: victor._id, tenantId: victor.tenantId, role: victor.role, status: victor.status } : 'NOT FOUND');
  
  const orgs = await Organization.find({});
  console.log('ALL ORGS:', orgs.map(o => ({ id: o._id, slug: o.slug, name: o.name })));

  const roles = await Role.find({});
  console.log('ALL ROLES:', roles.map(r => ({ id: r._id, key: r.key, name: r.name, permissions: r.permissions })));

  if (victor) {
    const victorRole = await Role.findOne({ key: victor.role });
    console.log('VICTOR ROLE IN DB:', victorRole ? { key: victorRole.key, permissions: victorRole.permissions } : 'NO ROLE FOUND');
  }

  const tasks = await ApprovalTask.find({});
  console.log('ALL APPROVAL TASKS in DB:', tasks.length);
  for (const t of tasks) {
    console.log(' Task:', {
      id: t._id,
      tenantId: t.tenantId,
      contractId: t.contractId,
      stageKey: t.stageKey,
      assignedUserId: t.assignedUserId,
      assignedRoleId: t.assignedRoleId,
      status: t.status
    });
  }

  const contracts = await Contract.find({});
  console.log('ALL CONTRACTS:', contracts.map(c => ({ id: c._id, contractNumber: c.contractNumber, status: c.status, tenantId: c.tenantId })));

  process.exit(0);
}
check().catch(console.error);
