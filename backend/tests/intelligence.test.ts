import { describe, expect, it } from 'vitest';
import { intelligenceSchemas } from '../src/services/intelligence.js';

describe('CovenX Intelligence governance schemas', () => {
  it('accepts structured risk findings with evidence and confidence', () => {
    const result = intelligenceSchemas.analysisSchema.parse({
      summary: 'The agreement contains a renewal obligation.',
      keyTerms: [{ name: 'Renewal', value: 'Annual', confidence: 0.92, evidence: 'renews annually' }],
      risks: [{ category: 'renewal', severity: 'medium', title: 'Auto-renewal', explanation: 'Notice is required.', recommendation: 'Add a renewal reminder.', evidence: '30 days notice', confidence: 0.8 }],
      missingInformation: [],
    });
    expect(result.risks[0].evidence).toBe('30 days notice');
  });

  it('rejects AI findings without evidence or with invalid confidence', () => {
    expect(() => intelligenceSchemas.analysisSchema.parse({ summary: 'x', keyTerms: [], risks: [{ category: 'legal', severity: 'high', title: 'Risk', explanation: 'x', recommendation: 'x', evidence: '', confidence: 1.2 }], missingInformation: [] })).toThrow();
  });

  it('requires human-review controls on question answers', () => {
    expect(() => intelligenceSchemas.answerSchema.parse({ answer: 'Answer', citations: [], confidence: 0.5 })).toThrow();
    expect(intelligenceSchemas.answerSchema.parse({ answer: 'Answer', citations: [{ label: 'Term', evidence: 'Clause 4' }], confidence: 0.5, needsHumanReview: true }).needsHumanReview).toBe(true);
  });
});
