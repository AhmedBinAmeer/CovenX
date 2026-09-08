import mongoose from 'mongoose';
import { Organization } from '../src/models/index.js';
import { seedRbac } from '../src/config/seed.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  const orgs = await Organization.find({});
  for (const org of orgs) {
    console.log('Seeding RBAC for org:', org.name, org._id);
    await seedRbac(String(org._id));
  }
  console.log('RBAC updated successfully for all organizations');
  process.exit(0);
}
run().catch(console.error);
