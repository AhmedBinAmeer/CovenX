import { describe, expect, it } from 'vitest';
import { chunkText, extractDocumentText } from '../src/services/ingestion.js';

describe('CovenX document intelligence ingestion', () => {
  it('extracts normalized plain text', async () => {
    const result = await extractDocumentText(Buffer.from('  Liability\u0000  cap\n\n\n is defined.  '), 'text/plain');
    expect(result.text).toBe('Liability cap\n\n is defined.');
  });
  it('creates overlapping bounded chunks', () => {
    const chunks = chunkText('word '.repeat(1200), 500, 50);
    expect(chunks.length).toBeGreaterThan(5);
    expect(chunks.every((chunk) => chunk.length <= 500)).toBe(true);
  });
  it('rejects unsupported document types', async () => {
    await expect(extractDocumentText(Buffer.from('data'), 'application/octet-stream')).rejects.toMatchObject({ message: 'FILE_TYPE_NOT_ALLOWED', status: 415 });
  });
});
