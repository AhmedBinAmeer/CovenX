import { useEffect } from 'react';
import type { RealtimeEvent } from '../services/realtime';
export function useRealtimeRefresh(events: RealtimeEvent[], refresh: () => void | Promise<void>) { useEffect(() => { const handler = (event: Event) => { const detail = (event as CustomEvent<{ event: RealtimeEvent }>).detail; if (detail?.event && events.includes(detail.event)) void refresh(); }; window.addEventListener('covenx:realtime', handler); return () => window.removeEventListener('covenx:realtime', handler); }, [events.join('|'), refresh]); }
