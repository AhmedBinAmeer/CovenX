import mongoose from 'mongoose';
import { Document } from '../src/models/index.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  const docs = await Document.find({});
  console.log('ALL DOCUMENTS:', docs.length);
  for (const d of docs) {
    console.log(' ', (d as any).fileName, '| uploadStatus:', (d as any).uploadStatus, '| scanStatus:', (d as any).scanStatus, '| version:', (d as any).version);
  }
  process.exit(0);
}
run().catch(console.error);
