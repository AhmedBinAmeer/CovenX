import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock3, ListFilter, RefreshCw } from 'lucide-react';
import { endpoints, listItems } from '../services/api';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';
import { obligationCompleteSchema, parseForm } from '../services/types';

const views = [{ key: 'open', label: 'Open' }, { key: 'overdue', label: 'Overdue' }, { key: 'in_progress', label: 'In progress' }, { key: 'completed', label: 'Completed' }];
function tone(priority: string) { return priority === 'critical' ? 'red' : priority === 'high' ? 'orange' : 'slate'; }

export function Obligations() {
  const [items, setItems] = useState<any[]>([]);
  const [view, setView] = useState('open');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => { setError(''); try { setItems(listItems(await endpoints.obligations(`status=${encodeURIComponent(view)}&limit=100`))); } catch (e: any) { setError(e.message); } };
  useEffect(() => { void load(); }, [view]);
  useRealtimeRefresh(['obligation.updated'], () => load());
  const urgentCount = useMemo(() => items.filter((item) => ['critical', 'high'].includes(item.priority)).length, [items]);
  const complete = async (obligation: any) => { const completionNote = window.prompt('Completion note'); if (!completionNote) return; setBusy(obligation._id); setError(''); try { const payload = parseForm(obligationCompleteSchema, { completionNote, version: obligation.version }); await endpoints.completeObligation(obligation._id, payload); await load(); } catch (e: any) { setError(e.issues?.[0]?.message ?? e.message); } finally { setBusy(null); } };
  return <>
    <div className="page-heading"><div><div className="eyebrow">Compliance monitoring</div><h1>Obligation command center</h1><p className="subtitle">Keep recurring commitments visible, owned, evidenced, and on time.</p></div><button className="btn btn-secondary" onClick={() => void load()}><RefreshCw size={15} /> Refresh</button></div>
    <div className="obligation-summary"><div className="obligation-summary-card"><span className="obligation-icon orange"><Clock3 size={17} /></span><div><strong>{items.length}</strong><span>{view.replace('_', ' ')} obligations</span></div></div><div className="obligation-summary-card"><span className="obligation-icon red"><AlertTriangle size={17} /></span><div><strong>{urgentCount}</strong><span>High-priority items</span></div></div><div className="obligation-summary-card"><span className="obligation-icon green"><CheckCircle2 size={17} /></span><div><strong>{items.filter((item) => item.status === 'completed').length}</strong><span>Completed in view</span></div></div></div>
    <section className="card table-card obligation-table"><div className="table-toolbar"><div><h2>Commitment queue</h2><div className="panel-caption">Review ownership, deadlines, and completion evidence.</div></div><div className="segmented-control" aria-label="Obligation status view"><ListFilter size={14} style={{ margin: '7px 2px 0 7px', color: '#7890a0' }} />{views.map((item) => <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}>{item.label}</button>)}</div></div>{error && <div className="notice" style={{ margin: 18 }}>{error}</div>}<div className="table-scroll">{items.length === 0 ? <div className="empty"><CheckCircle2 size={24} /><strong>No {view.replace('_', ' ')} obligations are currently assigned.</strong><span>Change the view or wait for the next lifecycle update.</span></div> : <table><thead><tr><th>Obligation</th><th>Owner</th><th>Due date</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((obligation: any) => <tr key={obligation._id}><td><strong>{obligation.title}</strong><div style={{ color: '#8293a0', fontSize: 11, marginTop: 4 }}>{obligation.type} · Contract {obligation.contractId}</div></td><td>{obligation.ownerId}</td><td><strong className={obligation.status === 'overdue' ? 'obligation-overdue' : ''}>{obligation.dueDate ? new Date(obligation.dueDate).toLocaleDateString() : '—'}</strong></td><td><span className={`badge badge-${tone(obligation.priority)}`}>{obligation.priority}</span></td><td><span className={`badge badge-${obligation.status === 'completed' ? 'green' : obligation.status === 'overdue' ? 'red' : 'orange'}`}>{obligation.status}</span></td><td>{obligation.status !== 'completed' && <button className="btn btn-primary btn-compact" disabled={busy === obligation._id} onClick={() => void complete(obligation)}><ClipboardCheck size={14} /> {busy === obligation._id ? 'Saving…' : 'Complete'}</button>}</td></tr>)}</tbody></table>}</div></section>
  </>;
}
