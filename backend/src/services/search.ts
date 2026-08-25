import { Contract } from '../models/index.js';
import mongoose from 'mongoose';
export type SearchQuery = { tenantId: string; q: string; limit?: number };
export interface SearchProvider { index(entity: any): Promise<void>; search(query: SearchQuery): Promise<any[]>; delete(id: string, tenantId: string): Promise<void>; checkHealth(): Promise<boolean>; }
export class MongoContractSearchProvider implements SearchProvider { async index(_entity: any) { return; } async search(query: SearchQuery) { const term = query.q.trim().slice(0, 120); if (!term) return []; return Contract.find({ tenantId: query.tenantId, $text: { $search: term } }).select('-financial').select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, updatedAt: -1, _id: -1 }).limit(Math.min(query.limit ?? 25, 100)); } async delete(_id: string, _tenantId: string) { return; } async checkHealth() { return mongoose.connection.readyState === 1; } }
export const searchProvider: SearchProvider = new MongoContractSearchProvider();
