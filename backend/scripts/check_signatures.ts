import mongoose from 'mongoose';
import { SignatureRequest, SignatureParticipant, Contract, User } from '../src/models/index.js';

async function checkSignatures() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  const contract = await Contract.findOne({ contractNumber: 'CTR-2026-001' });
  console.log('Contract:', contract ? { id: contract._id, number: contract.contractNumber, status: contract.status } : 'Not found');
  
  if (contract) {
    const reqs = await SignatureRequest.find({ contractId: contract._id });
    console.log('Signature requests:', reqs.length);
    for (const r of reqs) {
      console.log('  Request:', { id: r._id, status: r.status, provider: r.provider });
      const parts = await SignatureParticipant.find({ signatureRequestId: r._id });
      console.log('  Participants:', parts.map(p => ({ email: p.email, name: p.name, role: p.role, status: p.status, userId: p.userId })));
    }
  }

  const victor = await User.findOne({ email: 'vendor@demo.covenx.com' });
  console.log('Victor:', victor ? { id: victor._id, email: victor.email, roleIds: victor.roleIds } : 'Not found');

  process.exit(0);
}
checkSignatures().catch(console.error);
