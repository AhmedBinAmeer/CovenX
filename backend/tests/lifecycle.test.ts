import { describe, expect, it } from 'vitest';
import { assertTransition, canTransition } from '../src/services/lifecycle.js';

describe('CovenX contract lifecycle', () => {
  it('allows the defined forward lifecycle transitions', () => {
    expect(canTransition('draft', 'review')).toBe(true);
    expect(canTransition('review', 'approval')).toBe(true);
    expect(canTransition('approval', 'signature')).toBe(true);
    expect(canTransition('signature', 'active')).toBe(true);
    expect(canTransition('active', 'monitoring')).toBe(true);
    expect(canTransition('active', 'renewal')).toBe(true);
  });

  it('rejects invalid lifecycle transitions', () => {
    expect(canTransition('draft', 'active')).toBe(false);
    expect(() => assertTransition('archived', 'draft')).toThrow('INVALID_LIFECYCLE_TRANSITION');
  });
});
