import mongoose from 'mongoose';
import { Document } from '../src/models/index.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  const result = await Document.updateMany(
    { uploadStatus: { $ne: 'deleted' } },
    { $set: { uploadStatus: 'uploaded', scanStatus: 'clean' } }
  );
  console.log('Updated documents:', result);
  const docs = await Document.find({});
  for (const d of docs) {
    console.log(' ', (d as any).fileName, '| uploadStatus:', (d as any).uploadStatus, '| scanStatus:', (d as any).scanStatus);
  }
  process.exit(0);
}
run().catch(console.error);
