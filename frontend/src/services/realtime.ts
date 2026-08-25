import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

export type RealtimeEvent = 'notification.created' | 'approval.updated' | 'contract.updated' | 'obligation.updated' | 'dashboard.updated';

export function connectRealtime(onEvent: (event: RealtimeEvent, payload: any) => void): Socket | null {
  const token = getAccessToken();
  if (!token) return null;
  const url = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
  const socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
  const events: RealtimeEvent[] = ['notification.created', 'approval.updated', 'contract.updated', 'obligation.updated', 'dashboard.updated'];
  events.forEach((event) => socket.on(event, (payload) => onEvent(event, payload)));
  return socket;
}
