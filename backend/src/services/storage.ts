import crypto from 'node:crypto';

export type UploadRequest = { key: string; mimeType: string; sizeBytes: number; checksum: string };
export interface StorageProvider { createUploadUrl(input: UploadRequest): Promise<{ url: string; headers: Record<string, string>; expiresAt: Date }>; verifyUpload(key: string): Promise<{ exists: boolean; checksum?: string }>; createDownloadUrl(key: string): Promise<{ url: string; expiresAt: Date }>; deleteObject(key: string): Promise<void>; }
export class MockStorageProvider implements StorageProvider {
  private objects = new Map<string, { checksum: string; sizeBytes: number; mimeType: string }>();
  async createUploadUrl(input: UploadRequest) { this.objects.set(input.key, { checksum: input.checksum, sizeBytes: input.sizeBytes, mimeType: input.mimeType }); return { url: `mock://upload/${encodeURIComponent(input.key)}`, headers: { 'x-mock-checksum': input.checksum }, expiresAt: new Date(Date.now() + 15 * 60_000) }; }
  async verifyUpload(key: string) { const value = this.objects.get(key); return value ? { exists: true, checksum: value.checksum } : { exists: false }; }
  async createDownloadUrl(key: string) { if (!this.objects.has(key)) throw new Error('OBJECT_NOT_FOUND'); return { url: `mock://download/${encodeURIComponent(key)}`, expiresAt: new Date(Date.now() + 5 * 60_000) }; }
  async deleteObject(key: string) { this.objects.delete(key); }
}
export interface DocumentScanner { scan(input: { fileName: string; mimeType: string; checksum: string }): Promise<{ status: 'clean' | 'infected' | 'failed'; signature?: string }>; }
export class MockDocumentScanner implements DocumentScanner { async scan(input: { fileName: string; mimeType: string; checksum: string }) { const infected = /eicar|infected/i.test(input.fileName) || input.checksum === 'infected'; return infected ? { status: 'infected' as const, signature: 'mock-malware' } : { status: 'clean' as const }; } }
export const storageProvider = new MockStorageProvider();
export const documentScanner = new MockDocumentScanner();
export function storageKey(tenantId: string, documentId: string) { return `${tenantId}/documents/${documentId}/${crypto.randomUUID()}`; }
