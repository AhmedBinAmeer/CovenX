import { describe, expect, it } from 'vitest';
import { compareText, extractText } from '../src/services/collaboration.js';

describe('collaboration service', () => {
  it('returns side-by-side line blocks for a negotiation change', () => {
    const result = compareText('Payment is due in 30 days.\nConfidentiality survives.', 'Payment is due in 45 days.\nConfidentiality survives.');
    expect(result.summary.removed).toBe(1);
    expect(result.summary.added).toBe(1);
    expect(result.blocks.some((block) => block.type === 'removed' && block.text.includes('30'))).toBe(true);
    expect(result.blocks.some((block) => block.type === 'added' && block.text.includes('45'))).toBe(true);
  });

  it('extracts supported content references without exposing unrelated metadata', () => {
    expect(extractText({ contentRef: { text: 'Agreement body' } })).toBe('Agreement body');
    expect(extractText({ contentRef: { plainText: 'Plain body' } })).toBe('Plain body');
    expect(extractText({ contentRef: { checksum: 'secret', format: 'pdf' } })).toBe('');
  });
});
