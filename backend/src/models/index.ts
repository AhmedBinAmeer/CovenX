import mongoose, { Schema, model } from 'mongoose';

const base = { tenantId: { type: Schema.Types.ObjectId, required: true, index: true }, createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now } };

export const Permission = model('Permission', new Schema({ key: { type: String, unique: true, required: true }, resource: String, action: String, scopeType: String, description: String, status: { type: String, default: 'active' } }, { timestamps: true }));
export const Role = model('Role', new Schema({ ...base, name: { type: String, required: true }, key: { type: String, required: true }, permissionIds: [{ type: Schema.Types.ObjectId, ref: 'Permission' }], scopeRules: Schema.Types.Mixed, isSystemRole: Boolean, status: { type: String, default: 'active' } }, { timestamps: true }));
export const User = model('User', new Schema({ ...base, email: { type: String, required: true }, normalizedEmail: { type: String, required: true }, passwordHash: String, authProvider: { type: String, default: 'local' }, authVersion: { type: Number, default: 1 }, profile: Schema.Types.Mixed, organization: Schema.Types.Mixed, roleIds: [{ type: Schema.Types.ObjectId, ref: 'Role' }], status: { type: String, enum: ['invited', 'active', 'suspended', 'deactivated'], default: 'active' }, lastLoginAt: Date }, { timestamps: true }));
User.schema.index({ tenantId: 1, normalizedEmail: 1 }, { unique: true });
export const AuditLog = model('AuditLog', new Schema({ ...base, actorId: Schema.Types.Mixed, action: { type: String, required: true }, entity: { type: Schema.Types.Mixed, required: true }, oldValue: Schema.Types.Mixed, newValue: Schema.Types.Mixed, timestamp: { type: Date, default: Date.now }, requestId: String, sessionId: String, ip: String, userAgent: String, result: String, metadata: Schema.Types.Mixed }, { timestamps: false, versionKey: false }));
AuditLog.schema.index({ tenantId: 1, 'entity.type': 1, 'entity.id': 1, timestamp: -1 });
export const Contract = model('Contract', new Schema({ ...base, contractNumber: { type: String, required: true }, title: { type: String, required: true }, contractType: { type: String, required: true }, parties: [Schema.Types.Mixed], ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, departmentId: Schema.Types.ObjectId, businessUnitId: Schema.Types.ObjectId, status: { type: String, enum: ['draft', 'review', 'approval', 'signature', 'active', 'monitoring', 'renewal', 'archived'], default: 'draft' }, effectiveDate: Date, expiryDate: Date, renewal: Schema.Types.Mixed, financial: Schema.Types.Mixed, currentVersionId: Schema.Types.ObjectId, risk: Schema.Types.Mixed, tags: [String], metadata: Schema.Types.Mixed, version: { type: Number, default: 1 } }, { timestamps: true }));
Contract.schema.index({ tenantId: 1, contractNumber: 1 }, { unique: true });
Contract.schema.index({ tenantId: 1, status: 1, expiryDate: 1 });
Contract.schema.index({ tenantId: 1, ownerId: 1, status: 1 });
export const ContractVersion = model('ContractVersion', new Schema({ ...base, contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true }, versionNumber: { type: Number, required: true }, state: String, changeSummary: String, authorId: Schema.Types.ObjectId, previousVersionId: Schema.Types.ObjectId, contentRef: Schema.Types.Mixed, clauseRefs: [Schema.Types.ObjectId] }, { timestamps: true }));
ContractVersion.schema.index({ contractId: 1, versionNumber: 1 }, { unique: true });

export function asId(value: string): mongoose.Types.ObjectId { return new mongoose.Types.ObjectId(value); }
