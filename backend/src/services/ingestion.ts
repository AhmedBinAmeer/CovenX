import crypto from 'node:crypto';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { config } from '../config/index.js';
import { Document, DocumentChunk, asId } from '../models/index.js';
import { storageProvider } from './storage.js';

export type ExtractedDocument = { text: string; pages?: number };

async function remoteOcr(buffer: Buffer, pages?: number): Promise<ExtractedDocument | null> { const endpoint = process.env.OCR_SERVICE_URL; if (!endpoint) return null; const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.OCR_SERVICE_TOKEN ? { authorization: `Bearer ${process.env.OCR_SERVICE_TOKEN}` } : {}) }, body: JSON.stringify({ mimeType: 'application/pdf', contentBase64: buffer.toString('base64'), pages }), signal: AbortSignal.timeout(Number(process.env.OCR_SERVICE_TIMEOUT_MS ?? 30000)) }); if (!response.ok) throw new Error('OCR_SERVICE_UNAVAILABLE'); const value: any = await response.json().catch(() => ({})); return typeof value.text === 'string' ? { text: value.text, pages: Number(value.pages ?? pages ?? 0) || undefined } : null; }

export async function extractDocumentText(buffer: Buffer, mimeType: string): Promise<ExtractedDocument> {
  if (mimeType === 'application/pdf') { const parser = new PDFParse({ data: buffer }); try { const result = await parser.getText(); const text = result.text.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); if (text) return { text, pages: result.total }; const ocr = await remoteOcr(buffer, result.total); if (ocr) return { text: ocr.text.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(), pages: ocr.pages }; return { text: '', pages: result.total }; } finally { await parser.destroy(); } }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { const result = await mammoth.extractRawText({ buffer }); return { text: result.value.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() }; }
  if (mimeType === 'text/plain') return { text: buffer.toString('utf8').replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() };
  throw Object.assign(new Error('FILE_TYPE_NOT_ALLOWED'), { status: 415 });
}

export function chunkText(text: string, size = 1800, overlap = 220) {
  const normalized = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const chunks: string[] = []; let start = 0;
  while (start < normalized.length) { const end = Math.min(normalized.length, start + size); const boundary = end < normalized.length ? Math.max(start + 300, normalized.lastIndexOf(' ', end)) : end; const chunk = normalized.slice(start, boundary).trim(); if (chunk) chunks.push(chunk); if (boundary >= normalized.length) break; start = Math.max(start + 1, boundary - overlap); }
  return chunks;
}

function fallbackEmbedding(text: string, dimensions = 32) { const hash = crypto.createHash('sha256').update(text).digest(); const values = Array.from({ length: dimensions }, (_, index) => ((hash[index % hash.length] / 255) * 2) - 1); const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1; return values.map((value) => value / norm); }
async function embed(texts: string[]) {
  if (config.AI_PROVIDER === 'openai' && config.AI_API_KEY) { const client = new OpenAI({ apiKey: config.AI_API_KEY, baseURL: config.AI_BASE_URL || undefined }); const result = await client.embeddings.create({ model: process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small', input: texts }); return { vectors: result.data.map((item) => item.embedding), model: process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small' }; }
  return { vectors: texts.map((text) => fallbackEmbedding(text)), model: 'covenx-deterministic-v1' };
}

export async function indexDocument(tenantId: string, documentId: string, actorId: string) {
  const document: any = await Document.findOne({ _id: asId(documentId), tenantId }).select('+storageKey');
  if (!document) throw Object.assign(new Error('DOCUMENT_NOT_FOUND'), { status: 404 });
  if (document.scanStatus !== 'clean' || document.uploadStatus !== 'uploaded') throw Object.assign(new Error('DOCUMENT_NOT_READY'), { status: 409 });
  if (!storageProvider.readObject) throw new Error('STORAGE_READ_UNAVAILABLE');
  const buffer = await storageProvider.readObject(document.storageKey);
  const extracted = await extractDocumentText(buffer, document.mimeType);
  if (!extracted.text) throw Object.assign(new Error('DOCUMENT_TEXT_EMPTY'), { status: 422 });
  const chunks = chunkText(extracted.text);
  const vectors = await embed(chunks);
  await DocumentChunk.deleteMany({ tenantId, documentId: document._id });
  const records = chunks.map((text, chunkIndex) => ({ tenantId, documentId: document._id, contractId: document.contractId, contractVersionId: document.contractVersionId, chunkIndex, text, textHash: crypto.createHash('sha256').update(text).digest('hex'), tokenCount: Math.ceil(text.length / 4), pageStart: chunkIndex + 1, pageEnd: chunkIndex + 1, embedding: vectors.vectors[chunkIndex], embeddingModel: vectors.model, indexedAt: new Date(), metadata: { mimeType: document.mimeType, checksum: document.checksum } }));
  await DocumentChunk.insertMany(records);
  await Document.updateOne({ _id: document._id, tenantId }, { $set: { 'metadata.indexStatus': 'indexed', 'metadata.indexedAt': new Date(), 'metadata.chunkCount': records.length, 'metadata.indexedBy': actorId } });
  return { documentId, chunkCount: records.length, embeddingModel: vectors.model, textLength: extracted.text.length, pages: extracted.pages };
}

function cosine(a: number[], b: number[]) { const size = Math.min(a.length, b.length); let dot = 0; let na = 0; let nb = 0; for (let i = 0; i < size; i += 1) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1); }
export async function semanticSearch(tenantId: string, query: string, contractId?: string, limit = 10) {
  const vector = (await embed([query])).vectors[0]; const safeLimit = Math.min(limit, 50);
  if (config.VECTOR_SEARCH_PROVIDER === 'atlas') {
    const filter: any = { tenantId }; if (contractId) filter.contractId = asId(contractId);
    try { return await DocumentChunk.aggregate([{ $vectorSearch: { index: config.VECTOR_SEARCH_INDEX, path: 'embedding', queryVector: vector, numCandidates: Math.max(safeLimit * 20, 100), limit: safeLimit, filter: { tenantId: { $eq: tenantId }, ...(contractId ? { contractId: { $eq: asId(contractId) } } : {}) } } }, { $project: { embedding: 0, __v: 0, text: 1, textHash: 1, documentId: 1, contractId: 1, contractVersionId: 1, chunkIndex: 1, pageStart: 1, pageEnd: 1, metadata: 1, score: { $meta: 'vectorSearchScore' } } }]); } catch (error) { if (process.env.NODE_ENV === 'production') throw error; }
  }
  const filter: any = { tenantId }; if (contractId) filter.contractId = asId(contractId); const chunks: any[] = await DocumentChunk.find(filter).lean();
  const withScore = chunks.map((chunk) => { const score = cosine(vector, (chunk.embedding ?? []) as number[]); const { embedding: _embedding, ...safeChunk } = chunk; return { ...safeChunk, score }; }).sort((left, right) => right.score - left.score).slice(0, safeLimit);
  return withScore;
}
