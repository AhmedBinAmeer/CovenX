import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type UploadRequest = { key: string; mimeType: string; sizeBytes: number; checksum: string };
export interface StorageProvider { createUploadUrl(input: UploadRequest): Promise<{ url: string; headers: Record<string, string>; expiresAt: Date }>; verifyUpload(key: string): Promise<{ exists: boolean; checksum?: string }>; createDownloadUrl(key: string): Promise<{ url: string; expiresAt: Date }>; deleteObject(key: string): Promise<void>; checkHealth?(): Promise<boolean>; }
export class MockStorageProvider implements StorageProvider {
  private objects = new Map<string, { checksum: string; sizeBytes: number; mimeType: string }>();
  async createUploadUrl(input: UploadRequest) { this.objects.set(input.key, { checksum: input.checksum, sizeBytes: input.sizeBytes, mimeType: input.mimeType }); return { url: `mock://upload/${encodeURIComponent(input.key)}`, headers: { 'x-mock-checksum': input.checksum }, expiresAt: new Date(Date.now() + 15 * 60_000) }; }
  async verifyUpload(key: string) { const value = this.objects.get(key); return value ? { exists: true, checksum: value.checksum } : { exists: false }; }
  async createDownloadUrl(key: string) { if (!this.objects.has(key)) throw new Error('OBJECT_NOT_FOUND'); return { url: `mock://download/${encodeURIComponent(key)}`, expiresAt: new Date(Date.now() + 5 * 60_000) }; }
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
  async deleteObject(key: string) { this.ensureConfigured(); await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key })); }
  async checkHealth() { try { this.ensureConfigured(); await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: '.covenx-healthcheck' })); return true; } catch (error: any) { return error?.$metadata?.httpStatusCode === 404; } }
}
export interface DocumentScanner { scan(input: { fileName: string; mimeType: string; checksum: string }): Promise<{ status: 'clean' | 'infected' | 'failed'; signature?: string }>; }
export class MockDocumentScanner implements DocumentScanner { async scan(input: { fileName: string; mimeType: string; checksum: string }) { const infected = /eicar|infected/i.test(input.fileName) || input.checksum === 'infected'; return infected ? { status: 'infected' as const, signature: 'mock-malware' } : { status: 'clean' as const }; } }
export const mockStorageProvider = new MockStorageProvider();
export const storageProvider: StorageProvider = process.env.STORAGE_PROVIDER === 's3' ? new S3StorageProvider() : mockStorageProvider;
export const documentScanner = new MockDocumentScanner();
export function storageKey(tenantId: string, documentId: string) { return `${tenantId}/documents/${documentId}/${crypto.randomUUID()}`; }
