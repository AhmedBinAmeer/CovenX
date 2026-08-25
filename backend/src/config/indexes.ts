import { Contract, ContractVersion, User, Document, Notification, DashboardProjection } from '../models/index.js';
export async function verifyIndexes() { await Promise.all([User.createIndexes(), Contract.createIndexes(), ContractVersion.createIndexes(), Document.createIndexes(), Notification.createIndexes(), DashboardProjection.createIndexes()]); return true; }
export async function migrationStatus() { return { version: 1, indexesVerified: true, destructiveMigrations: false }; }
