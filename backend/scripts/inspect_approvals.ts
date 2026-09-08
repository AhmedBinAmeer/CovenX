import mongoose from 'mongoose';
import { ApprovalTask, Contract, User } from '../src/models/index.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  
  const contract = await Contract.findById('6aa04e525f633882170c950a');
  console.log('CONTRACT:', contract?.contractNumber, 'status:', contract?.status, 'version:', contract?.version);

  // Check all approval tasks in the system
  const allTasks = await ApprovalTask.find({});
  console.log('\nALL APPROVAL TASKS IN DB:', allTasks.length);
  for (const t of allTasks) {
    console.log('  task:', t._id.toString(), 'contractId:', (t as any).contractId?.toString(), 'assigneeUserId:', (t as any).assignedUserId?.toString(), 'assigneeRoleId:', (t as any).assignedRoleId?.toString(), 'status:', (t as any).status, 'stageKey:', (t as any).stageKey);
  }

  // Check Leo Legal's user id
  const leo = await User.findOne({ normalizedEmail: 'legal@demo.covenx.com' });
  console.log('\nLEO LEGAL userId:', leo?._id.toString());
  
  // Check if there are tasks for this contract
  const contractTasks = await ApprovalTask.find({ contractId: '6aa04e525f633882170c950a' });
  console.log('\nTASKS FOR CTR-2026-001:', contractTasks.length);

  process.exit(0);
}

run().catch(console.error);
