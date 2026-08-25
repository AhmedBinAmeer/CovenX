import { Contract } from '../models/index.js';
export type SearchQuery = { tenantId: string; q: string; limit?: number };
export interface SearchProvider { index(entity: any): Promise<void>; search(query: SearchQuery): Promise<any[]>; delete(id: string, tenantId: string): Promise<void>; }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export class MongoContractSearchProvider implements SearchProvider { async index(_entity: any) { return; } async search(query: SearchQuery) { const term = escapeRegex(query.q.trim()).slice(0, 120); if (!term) return []; return Contract.find({ tenantId: query.tenantId, $or: [{ contractNumber: new RegExp(term, 'i') }, { title: new RegExp(term, 'i') }, { contractType: new RegExp(term, 'i') }, { 'parties.name': new RegExp(term, 'i') }, { 'metadata.searchText': new RegExp(term, 'i') }] }).select('-financial').sort({ updatedAt: -1, _id: -1 }).limit(Math.min(query.limit ?? 25, 100)); } async delete(_id: string, _tenantId: string) { return; } }
export const searchProvider: SearchProvider = new MongoContractSearchProvider();
