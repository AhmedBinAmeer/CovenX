import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { verifyAccess } from './auth.js';
import { Contract } from '../models/index.js';

export function attachRealtime(server: HttpServer) {
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean);
  const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
  io.use((socket, next) => { try { const token = String(socket.handshake.auth?.token ?? socket.handshake.headers.authorization ?? '').replace(/^Bearer\s+/i, ''); const auth = verifyAccess(token); socket.data.auth = auth; next(); } catch { next(new Error('AUTHENTICATION_REQUIRED')); } });
  io.on('connection', (socket) => { const auth = socket.data.auth; socket.join(`tenant:${auth.tenantId}`); socket.join(`user:${auth.userId}`); socket.on('contract:join', async (contractId: string, callback?: (result: any) => void) => { const allowed = await Contract.exists({ _id: contractId, tenantId: auth.tenantId }); if (allowed) socket.join(`contract:${contractId}`); callback?.({ allowed: Boolean(allowed) }); }); socket.on('contract:leave', (contractId: string) => socket.leave(`contract:${contractId}`)); });
  return io;
}
export function emitRealtime(io: Server, event: 'notification.created' | 'approval.updated' | 'contract.updated' | 'obligation.updated' | 'dashboard.updated' | 'contract.redline.created' | 'contract.comment.created' | 'contract.comment.resolved', input: { tenantId: string; userId?: string; contractId?: string; payload: any }) { const safePayload = { ...input.payload, tenantId: input.tenantId, ...(input.contractId ? { contractId: input.contractId } : {}) }; io.to(`tenant:${input.tenantId}`).emit(event, safePayload); if (input.userId) io.to(`user:${input.userId}`).emit(event, safePayload); if (input.contractId) io.to(`contract:${input.contractId}`).emit(event, safePayload); }
