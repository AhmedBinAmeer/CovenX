import { describe, expect, it } from 'vitest';
import { workflowMatches } from '../src/services/workflow.js';

describe('CovenX workflow execution rules', () => {
  it('matches contract type, threshold, department, business unit, and risk rules', () => {
    const workflow = { triggerRules: [{ contractType: 'service', minValue: 100000, departmentId: 'dep-1', businessUnitId: 'bu-1', riskClassification: 'high' }] };
    expect(workflowMatches(workflow, { contractType: 'service', value: 125000, departmentId: 'dep-1', businessUnitId: 'bu-1', riskClassification: 'high' })).toBe(true);
    expect(workflowMatches(workflow, { contractType: 'service', value: 50000, departmentId: 'dep-1', businessUnitId: 'bu-1', riskClassification: 'high' })).toBe(false);
  });

  it('rejects a mismatch on organizational scope', () => {
    const workflow = { triggerRules: [{ departmentId: 'legal' }] };
    expect(workflowMatches(workflow, { departmentId: 'finance' })).toBe(false);
  });
});
