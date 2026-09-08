import mongoose from 'mongoose';
import { Document } from '../src/models/index.js';
import { indexDocument } from '../src/services/ingestion.js';
import { storageProvider } from '../src/services/storage.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/covenx');
  const doc: any = await Document.findOne({ scanStatus: 'clean', uploadStatus: 'uploaded' }).select('+storageKey');
  if (!doc) {
    console.log('No clean uploaded doc found');
    process.exit(0);
  }
  console.log('Testing doc:', doc.fileName, doc._id);
  
  // Test download url
  const dl = await storageProvider.createDownloadUrl(doc.storageKey);
  console.log('Download URL generated successfully:', dl.url.slice(0, 50) + '...');
  
  // Test indexing
  const indexRes = await indexDocument(String(doc.tenantId), String(doc._id), String(doc.uploadedBy || doc._id));
  console.log('Indexed successfully:', indexRes);

  process.exit(0);
}
test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
