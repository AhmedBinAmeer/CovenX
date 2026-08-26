import { ApiError, ApprovalTask, CollaborationComment, Contract, ContractIntelligence, ContractVersion, DocumentRecord, Id, NotificationRecord, Obligation, Paginated, Session, User, VersionComparison } from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const browserStorage = typeof window !== 'undefined' ? window.localStorage : null;
let accessToken = browserStorage?.getItem('covenx_access_token') ?? null;

export function setAccessToken(token: string | null) { accessToken = token; if (token) browserStorage?.setItem('covenx_access_token', token); else browserStorage?.removeItem('covenx_access_token'); }
export function getAccessToken() { return accessToken; }
export function listItems<T>(value: Paginated<T> | T[] | { items?: T[] } | undefined): T[] { return Array.isArray(value) ? value : value?.items ?? []; }
export function pageInfo<T>(value: Paginated<T> | T[] | { items?: T[] } | undefined) { return Array.isArray(value) ? { items: value, nextCursor: null } : { items: value?.items ?? [], nextCursor: (value as Paginated<T> | undefined)?.nextCursor ?? null }; }

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshed.ok) { const body = await refreshed.json(); setAccessToken(body.data?.accessToken ?? null); return request<T>(path, init, false); }
    setAccessToken(null);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) { const error: ApiError = body.error ?? { code: `HTTP_${response.status}`, message: 'Request failed' }; throw Object.assign(new Error(error.message), error); }
  return body.data as T;
}
const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
const patch = (body: unknown): RequestInit => ({ method: 'PATCH', body: JSON.stringify(body) });

export const endpoints = {
  login: (body: unknown) => request<{ accessToken: string; user: User; organization?: any }>('/auth/login', json(body)),
  register: (body: unknown) => request<{ accessToken: string; user: User; organization: any; emailVerificationRequired: boolean }>('/auth/register', json(body)),
  me: () => request<{ user: User; roles: any[]; permissions: string[]; organization?: any }>('/auth/me'),
  onboarding: () => request<any>('/onboarding'),
  updateOnboarding: (body: unknown) => request<any>('/onboarding', patch(body)),
  logout: () => request<void>('/auth/logout', json({})),
  sessions: () => request<Session[]>('/auth/sessions'),
  revokeSession: (id: string) => request<void>(`/auth/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  users: (query = '') => request<Paginated<User> | User[]>(`/users${query ? `?${query}` : ''}`),
  createUser: (body: unknown) => request<User>('/users', json(body)),
  user: (id: Id) => request<User>(`/users/${id}`),
  updateUser: (id: Id, body: unknown) => request<User>(`/users/${id}`, patch(body)),
  deleteUser: (id: Id) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  roles: () => request<any[]>('/roles'),
  createRole: (body: unknown) => request<any>('/roles', json(body)),
  updateRole: (id: Id, body: unknown) => request<any>(`/roles/${id}`, patch(body)),
  permissions: () => request<any[]>('/permissions'),
  dashboardSummary: () => request<any>('/dashboard/summary'),
  dashboardContracts: () => request<any>('/dashboard/contracts'),
  dashboardApprovals: () => request<any>('/dashboard/approvals'),
  dashboardObligations: () => request<any>('/dashboard/obligations'),
  contracts: (query = '') => request<Paginated<Contract> | Contract[]>(`/contracts${query ? `?${query}` : ''}`),
  contract: (id: Id) => request<Contract>(`/contracts/${id}`),
  createContract: (body: unknown) => request<Contract>('/contracts', json(body)),
  updateContract: (id: Id, body: unknown) => request<Contract>(`/contracts/${id}`, patch(body)),
  archiveContract: (id: Id, version: number) => request<Contract>(`/contracts/${id}/archive`, json({ version })),
  deleteContract: (id: Id) => request<void>(`/contracts/${id}`, { method: 'DELETE' }),
  submitReview: (id: Id, version: number) => request<any>(`/contracts/${id}/submit-review`, json({ version })),
  renewContract: (id: Id, targetExpiryDate?: string) => request<any>(`/contracts/${id}/renew`, json(targetExpiryDate ? { targetExpiryDate } : {})),
  contractHistory: (id: Id) => request<any[]>(`/contracts/${id}/history`),
  contractVersions: (id: Id) => request<ContractVersion[]>(`/contracts/${id}/versions`),
  contractIntelligence: (id: Id) => request<ContractIntelligence[]>(`/contracts/${id}/intelligence`),
  analyzeContract: (id: Id, body: unknown = {}) => request<ContractIntelligence>(`/contracts/${id}/intelligence/analyze`, json(body)),
  askContract: (id: Id, body: unknown) => request<ContractIntelligence>(`/contracts/${id}/intelligence/ask`, json(body)),
  semanticSearch: (body: unknown) => request<any[]>('/search/semantic', json(body)),
  reviewIntelligence: (id: Id, body: unknown) => request<ContractIntelligence>(`/intelligence/${id}/review`, json(body)),
  createContractVersion: (id: Id, body: unknown) => request<ContractVersion>(`/contracts/${id}/versions`, json(body)),
  compareContractVersions: (id: Id, fromVersionId: Id, toVersionId: Id) => request<VersionComparison>(`/contracts/${id}/compare?fromVersionId=${encodeURIComponent(fromVersionId)}&toVersionId=${encodeURIComponent(toVersionId)}`),
  contractComments: (id: Id, versionId?: Id) => request<CollaborationComment[]>(`/contracts/${id}/comments${versionId ? `?versionId=${encodeURIComponent(versionId)}` : ''}`),
  createContractComment: (id: Id, body: unknown) => request<CollaborationComment>(`/contracts/${id}/comments`, json(body)),
  createContractRedline: (id: Id, body: unknown) => request<{ contract: Contract; version: ContractVersion }>(`/contracts/${id}/redlines`, json(body)),
  resolveComment: (id: Id, version: number) => request<CollaborationComment>(`/comments/${id}/resolve`, json({ version })),
  contractApprovals: (id: Id) => request<ApprovalTask[]>(`/contracts/${id}/approvals`),
  requestSignature: (id: Id, body: unknown) => request<any>(`/contracts/${id}/signature/request`, json(body)),
  signatures: (id: Id) => request<any[]>(`/contracts/${id}/signatures`),
  completeSignature: (id: Id, body: unknown) => request<any>(`/signatures/${id}/complete`, json(body)),
  declineSignature: (id: Id, body: unknown) => request<any>(`/signatures/${id}/decline`, json(body)),
  obligations: (query = '') => request<Paginated<Obligation> | Obligation[]>(`/obligations${query ? `?${query}` : ''}`),
  obligation: (id: Id) => request<Obligation>(`/obligations/${id}`),
  createObligation: (body: unknown) => request<Obligation>('/obligations', json(body)),
  updateObligation: (id: Id, body: unknown) => request<Obligation>(`/obligations/${id}`, patch(body)),
  completeObligation: (id: Id, body: unknown) => request<Obligation>(`/obligations/${id}/complete`, json(body)),
  documents: (contractId = 'all') => request<Paginated<DocumentRecord> | DocumentRecord[]>(`/documents?contractId=${encodeURIComponent(contractId)}`),
  documentsForContract: (id: Id) => request<Paginated<DocumentRecord> | DocumentRecord[]>(`/documents?contractId=${encodeURIComponent(id)}`),
  document: (id: Id) => request<DocumentRecord>(`/documents/${id}`),
  initiateUpload: (body: unknown) => request<any>('/documents/upload', json(body)),
  finalizeUpload: (id: Id, checksum: string) => request<any>(`/documents/${id}/finalize`, json({ checksum })),
  indexDocument: (id: Id) => request<any>(`/documents/${id}/index`, json({})),
  downloadDocument: (id: Id) => request<{ url: string; expiresAt: string }>(`/documents/${id}/download`),
  deleteDocument: (id: Id, version: number) => request<void>(`/documents/${id}`, json({ version })),
  notifications: (query = '') => request<Paginated<NotificationRecord> | NotificationRecord[]>(`/notifications${query ? `?${query}` : ''}`),
  markNotificationRead: (id: Id, version: number) => request<NotificationRecord>(`/notifications/${id}/read`, patch({ version })),
  notificationPreferences: () => request<any>('/notifications/preferences'),
  saveNotificationPreferences: (body: unknown) => request<any>('/notifications/preferences', json(body)),
  templates: (query = '') => request<any[] | Paginated<any>>(`/templates${query ? `?${query}` : ''}`),
  template: (id: Id) => request<any>(`/templates/${id}`),
  createTemplate: (body: unknown) => request<any>('/templates', json(body)),
  updateTemplate: (id: Id, body: unknown) => request<any>(`/templates/${id}`, patch(body)),
  clauses: (query = '') => request<any[] | Paginated<any>>(`/clauses${query ? `?${query}` : ''}`),
  createClause: (body: unknown) => request<any>('/clauses', json(body)),
  updateClause: (id: Id, body: unknown) => request<any>(`/clauses/${id}`, patch(body)),
  workflows: (query = '') => request<any[] | Paginated<any>>(`/workflows${query ? `?${query}` : ''}`),
  workflow: (id: Id) => request<any>(`/workflows/${id}`),
  createWorkflow: (body: unknown) => request<any>('/workflows', json(body)),
  updateWorkflow: (id: Id, body: unknown) => request<any>(`/workflows/${id}`, patch(body)),
  approvals: (query = '') => request<Paginated<ApprovalTask> | ApprovalTask[]>(`/approvals${query ? `?${query}` : ''}`),
  approve: (id: Id, body: unknown) => request<any>(`/approvals/${id}/approve`, json(body)),
  reject: (id: Id, body: unknown) => request<any>(`/approvals/${id}/reject`, json(body)),
  delegateApproval: (id: Id, body: unknown) => request<any>(`/approvals/${id}/delegate`, json(body)),
  audit: (query = '') => request<any[] | Paginated<any>>(`/audit${query ? `?${query}` : ''}`),
  intakeQuestionnaires: (contractType = '') => request<any[]>(`/intake/questionnaires${contractType ? `?contractType=${encodeURIComponent(contractType)}` : ''}`),
  intakeRequests: (query = '') => request<any[]>(`/intake/requests${query ? `?${query}` : ''}`),
  createIntakeRequest: (body: unknown) => request<any>('/intake/requests', json(body)),
  convertIntakeRequest: (id: Id, body: unknown = {}) => request<any>(`/intake/requests/${id}/convert`, json(body)),
  integrations: () => request<any[]>('/integrations'),
  createIntegration: (body: unknown) => request<any>('/integrations', json(body)),
  updateIntegration: (id: Id, body: unknown) => request<any>(`/integrations/${id}`, patch(body)),
  testIntegration: (id: Id) => request<any>(`/integrations/${id}/test`, json({})),
};
