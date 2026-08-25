export type ContractState = 'draft' | 'review' | 'approval' | 'signature' | 'active' | 'monitoring' | 'renewal' | 'archived';

const transitions: Record<ContractState, ContractState[]> = {
  draft: ['review'],
  review: ['draft', 'approval'],
  approval: ['review', 'draft', 'signature'],
  signature: ['approval', 'active'],
  active: ['monitoring', 'renewal', 'archived'],
  monitoring: ['renewal', 'archived'],
  renewal: ['review', 'active', 'archived'],
  archived: []
};

export function canTransition(from: ContractState, to: ContractState): boolean { return transitions[from]?.includes(to) ?? false; }
export function assertTransition(from: ContractState, to: ContractState): void { if (!canTransition(from, to)) { const error = new Error('INVALID_LIFECYCLE_TRANSITION'); (error as any).status = 409; throw error; } }
export { transitions };
