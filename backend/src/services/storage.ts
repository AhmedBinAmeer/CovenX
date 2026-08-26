import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type UploadRequest = { key: string; mimeType: string; sizeBytes: number; checksum: string };
export interface StorageProvider { createUploadUrl(input: UploadRequest): Promise<{ url: string; headers: Record<string, string>; expiresAt: Date }>; verifyUpload(key: string): Promise<{ exists: boolean; checksum?: string }>; createDownloadUrl(key: string): Promise<{ url: string; expiresAt: Date }>; readObject?(key: string): Promise<Buffer>; deleteObject(key: string): Promise<void>; checkHealth?(): Promise<boolean>; }
export class MockStorageProvider implements StorageProvider {
  private objects = new Map<string, { checksum: string; sizeBytes: number; mimeType: string; body?: Buffer }>();
  async createUploadUrl(input: UploadRequest) { this.objects.set(input.key, { checksum: input.checksum, sizeBytes: input.sizeBytes, mimeType: input.mimeType }); return { url: `mock://upload/${encodeURIComponent(input.key)}`, headers: { 'x-mock-checksum': input.checksum }, expiresAt: new Date(Date.now() + 15 * 60_000) }; }
  async verifyUpload(key: string) { const value = this.objects.get(key); return value ? { exists: true, checksum: value.checksum } : { exists: false }; }
  async createDownloadUrl(key: string) { if (!this.objects.has(key)) throw new Error('OBJECT_NOT_FOUND'); return { url: `mock://download/${encodeURIComponent(key)}`, expiresAt: new Date(Date.now() + 5 * 60_000) }; }
  async readObject(key: string) { const object = this.objects.get(key); if (!object?.body) throw new Error('OBJECT_CONTENT_UNAVAILABLE'); return object.body; }
  async deleteObject(key: string) { this.objects.delete(key); }
  async checkHealth() { return true; }
}
export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client; private readonly bucket: string; private readonly expiry: number;
  constructor() { this.bucket = process.env.AWS_BUCKET ?? ''; this.expiry = Number(process.env.STORAGE_URL_EXPIRY_SECONDS ?? 900); this.client = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' }); }
  private ensureConfigured() { if (!this.bucket) throw new Error('STORAGE_NOT_CONFIGURED'); }
  async createUploadUrl(input: UploadRequest) { this.ensureConfigured(); const expiresAt = new Date(Date.now() + this.expiry * 1000); const command = new PutObjectCommand({ Bucket: this.bucket, Key: input.key, ContentType: input.mimeType, ContentLength: input.sizeBytes, Metadata: { checksum: input.checksum } }); return { url: await getSignedUrl(this.client, command, { expiresIn: this.expiry }), headers: { 'content-type': input.mimeType, 'x-amz-meta-checksum': input.checksum }, expiresAt }; }
  async verifyUpload(key: string) { this.ensureConfigured(); try { const object: any = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key })); return { exists: true, checksum: object.Metadata?.checksum }; } catch { return { exists: false }; } }
  async createDownloadUrl(key: string) { this.ensureConfigured(); const expiresAt = new Date(Date.now() + this.expiry * 1000); return { url: await getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: this.expiry }), expiresAt }; }
  async readObject(key: string) { this.ensureConfigured(); const result: any = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key })); return Buffer.from(await result.Body.transformToByteArray()); }
  async deleteObject(key: string) { this.ensureConfigured(); await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key })); }
  async checkHealth() { try { this.ensureConfigured(); await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: '.covenx-healthcheck' })); return true; } catch (error: any) { return error?.$metadata?.httpStatusCode === 404; } }
}
export interface DocumentScanner { scan(input: { fileName: string; mimeType: string; checksum: string; storageKey?: string }): Promise<{ status: 'clean' | 'infected' | 'failed'; signature?: string }>; }
export class MockDocumentScanner implements DocumentScanner { async scan(input: { fileName: string; mimeType: string; checksum: string }) { const infected = /eicar|infected/i.test(input.fileName) || input.checksum === 'infected'; return infected ? { status: 'infected' as const, signature: 'mock-malware' } : { status: 'clean' as const }; } }
export class HttpDocumentScanner implements DocumentScanner { private readonly endpoint = process.env.DOCUMENT_SCANNER_URL ?? ''; async scan(input: { fileName: string; mimeType: string; checksum: string; storageKey?: string }) { if (!this.endpoint) throw new Error('DOCUMENT_SCANNER_NOT_CONFIGURED'); const response = await fetch(this.endpoint, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.DOCUMENT_SCANNER_TOKEN ? { authorization: `Bearer ${process.env.DOCUMENT_SCANNER_TOKEN}` } : {}) }, body: JSON.stringify(input), signal: AbortSignal.timeout(Number(process.env.DOCUMENT_SCANNER_TIMEOUT_MS ?? 15000)) }); if (!response.ok) return { status: 'failed' as const, signature: `scanner_http_${response.status}` }; const body: any = await response.json().catch(() => ({})); if (!['clean', 'infected', 'failed'].includes(body.status)) return { status: 'failed' as const, signature: 'scanner_invalid_response' }; return { status: body.status, signature: body.signature }; } }
export const mockStorageProvider = new MockStorageProvider();
export const storageProvider: StorageProvider = process.env.STORAGE_PROVIDER === 's3' ? new S3StorageProvider() : mockStorageProvider;
export const documentScanner: DocumentScanner = process.env.DOCUMENT_SCANNER_PROVIDER === 'http' ? new HttpDocumentScanner() : new MockDocumentScanner();
export function storageKey(tenantId: string, documentId: string) { return `${tenantId}/documents/${documentId}/${crypto.randomUUID()}`; }
