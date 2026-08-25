import { describe, expect, it } from 'vitest';
import { MockDocumentScanner, MockStorageProvider } from '../src/services/storage.js';

describe('CovenX document storage foundation', () => {
  it('creates upload and short-lived download URLs through the provider abstraction', async () => {
    const storage = new MockStorageProvider();
    const upload = await storage.createUploadUrl({ key: 'tenant/doc/1', mimeType: 'application/pdf', sizeBytes: 1024, checksum: 'a'.repeat(64) });
    expect(upload.url).toContain('mock://upload');
    expect((await storage.verifyUpload('tenant/doc/1')).exists).toBe(true);
    const download = await storage.createDownloadUrl('tenant/doc/1');
    expect(download.url).toContain('mock://download');
    expect(download.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('blocks mock malware signatures and allows clean documents', async () => {
    const scanner = new MockDocumentScanner();
    expect((await scanner.scan({ fileName: 'agreement.pdf', mimeType: 'application/pdf', checksum: 'a'.repeat(64) })).status).toBe('clean');
    expect((await scanner.scan({ fileName: 'eicar-test.txt', mimeType: 'text/plain', checksum: 'b'.repeat(64) })).status).toBe('infected');
  });
});
