import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarClock, CheckCircle2, Clock3, RefreshCw, ShieldAlert } from 'lucide-react';
import { endpoints } from '../services/api';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

const windows = [{ key: '30', label: 'Next 30 days' }, { key: '90', label: 'Next 90 days' }, { key: '180', label: 'Next 180 days' }];
function dateOnly(date: Date) { return date.toISOString().slice(0, 10); }
function urgency(expiry: string) { const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000); return days <= 30 ? 'critical' : days <= 90 ? 'soon' : 'planned'; }

export function Renewals({ navigate }: { navigate: (path: string) => void }) {
  const [windowDays, setWindowDays] = useState('90');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const to = useMemo(() => { const now = new Date(); const end = new Date(now); end.setDate(end.getDate() + Number(windowDays)); return { from: dateOnly(now), to: dateOnly(end) }; }, [windowDays]);
  const load = async () => { setLoading(true); setError(''); try { const data: any = await endpoints.contracts(new URLSearchParams({ status: 'active,monitoring,renewal', expiryFrom: to.from, expiryTo: to.to, limit: '100' }).toString()); setItems(Array.isArray(data) ? data : data?.items ?? []); } catch (e: any) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [to.from, to.to]);
  useRealtimeRefresh(['contract.updated', 'obligation.updated'], () => load());
  const critical = items.filter((item) => urgency(item.expiryDate) === 'critical').length;
  const soon = items.filter((item) => urgency(item.expiryDate) === 'soon').length;
  return <>
    <div className="page-heading"><div><div className="eyebrow">Portfolio continuity</div><h1>Renewals & expirations</h1><p className="subtitle">Protect notice windows, prioritize owner action, and keep every agreement moving.</p></div><button className="btn btn-secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={15} /> Refresh</button></div>
    <div className="renewal-summary"><div className="renewal-summary-card"><span className="renewal-icon orange"><ShieldAlert size={17} /></span><div><strong>{critical}</strong><span>Critical · next 30 days</span></div></div><div className="renewal-summary-card"><span className="renewal-icon blue"><Clock3 size={17} /></span><div><strong>{soon}</strong><span>Priority · next 90 days</span></div></div><div className="renewal-summary-card"><span className="renewal-icon green"><CheckCircle2 size={17} /></span><div><strong>{items.length}</strong><span>Tracked in current window</span></div></div></div>
    <div className="card table-card renewal-table"><div className="table-toolbar"><div><h2>Renewal pipeline</h2><div className="panel-caption">Active, monitoring, and renewal agreements with an expiry date.</div></div><div className="segmented-control" aria-label="Renewal time window">{windows.map((item) => <button key={item.key} className={windowDays === item.key ? 'active' : ''} onClick={() => setWindowDays(item.key)}>{item.label}</button>)}</div></div>{error && <div className="notice" style={{ margin: 18 }}>{error}</div>}{loading ? <div className="portfolio-skeleton"><i /><i /><i /></div> : items.length === 0 ? <div className="empty"><CalendarClock size={24} /><strong>No upcoming expirations in this window.</strong><span>Expand the window or review archived agreements.</span></div> : <div className="table-scroll"><table><thead><tr><th>Contract</th><th>Owner</th><th>Lifecycle</th><th>Expiry</th><th>Renewal action</th><th /></tr></thead><tbody>{items.map((item) => { const state = urgency(item.expiryDate); return <tr key={item._id}><td><button className="table-link" onClick={() => navigate(`/contracts/${item._id}`)}><strong>{item.contractNumber ?? 'Unnumbered'}</strong><span>{item.title ?? 'Untitled agreement'}</span></button></td><td>{item.ownerId ?? 'Assigned owner'}</td><td><span className={`badge badge-${item.status === 'renewal' ? 'orange' : 'green'}`}>{item.status}</span></td><td><strong className={`renewal-date ${state}`}>{new Date(item.expiryDate).toLocaleDateString()}</strong></td><td><button className="btn btn-secondary btn-compact" onClick={() => navigate(`/contracts/${item._id}`)}><CalendarClock size={14} /> Review renewal</button></td><td><button className="icon-button" aria-label={`Open ${item.contractNumber ?? 'contract'}`} onClick={() => navigate(`/contracts/${item._id}`)}><ArrowUpRight size={15} /></button></td></tr>; })}</tbody></table></div>}</div>
  </>;
}
