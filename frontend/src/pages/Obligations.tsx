import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ClipboardCheck, Clock3, ListFilter,
  Plus, RefreshCw, Sparkles, X,
} from 'lucide-react';
import { endpoints, listItems } from '../services/api';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';
import { obligationCompleteSchema, obligationCreateSchema, parseForm } from '../services/types';
import { TiltCard, Reveal } from '../components/Motion';
import { useAuth } from '../main';

const views = [
  { key: 'open', label: 'Open' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

const OBLIGATION_TYPES = [
  'Delivery', 'Payment', 'Compliance', 'Reporting', 'Renewal Notice',
  'Audit', 'Insurance Certificate', 'SLA Review', 'Other',
];

function tone(priority: string) {
  return priority === 'critical' ? 'red' : priority === 'high' ? 'orange' : 'slate';
}

function ownerLabel(id: string, users: any[]): string {
  const found = users.find((u: any) => u._id === id);
  if (!found) return id ? id.slice(-6) + '…' : '—';
  return found.profile?.displayName ?? found.profile?.firstName ?? found.email ?? '—';
}

const EMPTY_FORM = {
  contractId: '',
  type: 'Compliance',
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  dueDate: '',
};

export function Obligations() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [view, setView] = useState('open');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  const canCreate = (user?.permissions as string[] | undefined)?.includes('obligation:create') ?? false;
  const canReadUsers = (user?.permissions as string[] | undefined)?.includes('user:read') ?? false;

  const load = async () => {
    setError('');
    try {
      setItems(listItems(await endpoints.obligations(`status=${encodeURIComponent(view)}&limit=100`)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Load contracts + users once for dropdowns and owner labels
  useEffect(() => {
    endpoints.contracts('limit=100').then((res) => setContracts(listItems(res as any))).catch(() => {});
    if (canReadUsers) {
      endpoints.users('limit=100').then((res) => setUsers(listItems(res as any))).catch(() => {});
    }
  }, [canReadUsers]);

  useEffect(() => { void load(); }, [view]);
  useRealtimeRefresh(['obligation.updated'], () => load());

  const urgentCount = useMemo(
    () => items.filter((item) => ['critical', 'high'].includes(item.priority)).length,
    [items],
  );

  const complete = async (obligation: any) => {
    const completionNote = window.prompt('Completion note (required)');
    if (!completionNote) return;
    setBusy(obligation._id);
    setError('');
    try {
      const payload = parseForm(obligationCompleteSchema, { completionNote, version: obligation.version });
      await endpoints.completeObligation(obligation._id, payload);
      await load();
    } catch (e: any) {
      setError(e.issues?.[0]?.message ?? e.message);
    } finally {
      setBusy(null);
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.contractId) { setFormError('Please select a contract.'); return; }
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.dueDate) { setFormError('Due date is required.'); return; }
    setCreating(true);
    try {
      // Due date: set to end of that day in ISO format
      const dueIso = new Date(form.dueDate + 'T23:59:59.000Z').toISOString();
      const payload = parseForm(obligationCreateSchema, {
        contractId: form.contractId,
        ownerId: user?._id,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: dueIso,
      });
      await endpoints.createObligation(payload);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setView('open');
      await load();
    } catch (e: any) {
      setFormError(e.issues?.[0]?.message ?? e.message ?? 'Failed to create obligation.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Reveal direction="up" delay={20}>
        <div className="page-heading">
          <div>
            <div className="eyebrow"><Sparkles size={13} /> Compliance monitoring</div>
            <h1>Obligation command center</h1>
            <p className="subtitle">Keep recurring commitments visible, owned, evidenced, and on time.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canCreate && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={15} /> New obligation
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => void load()}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal direction="up" delay={50}>
        <div className="obligation-summary">
          <TiltCard className="obligation-summary-card" maxTilt={3}>
            <span className="obligation-icon orange"><Clock3 size={17} /></span>
            <div>
              <strong>{items.length}</strong>
              <span>{view.replace('_', ' ')} obligations</span>
            </div>
          </TiltCard>
          <TiltCard className="obligation-summary-card" maxTilt={3}>
            <span className="obligation-icon red"><AlertTriangle size={17} /></span>
            <div>
              <strong>{urgentCount}</strong>
              <span>High-priority items</span>
            </div>
          </TiltCard>
          <TiltCard className="obligation-summary-card" maxTilt={3}>
            <span className="obligation-icon green"><CheckCircle2 size={17} /></span>
            <div>
              <strong>{items.filter((item) => item.status === 'completed').length}</strong>
              <span>Completed in view</span>
            </div>
          </TiltCard>
        </div>
      </Reveal>

      <Reveal direction="up" delay={80}>
        <TiltCard className="card table-card obligation-table" maxTilt={1.2}>
          <div className="table-toolbar">
            <div>
              <h2>Commitment queue</h2>
              <div className="panel-caption">Review ownership, deadlines, and completion evidence.</div>
            </div>
            <div className="segmented-control" aria-label="Obligation status view">
              <ListFilter size={14} style={{ marginLeft: 8, marginRight: 2, color: '#7890a0', flexShrink: 0 }} />
              {views.map((item) => (
                <button
                  key={item.key}
                  className={view === item.key ? 'active' : ''}
                  onClick={() => setView(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="notice" style={{ margin: 18 }}>{error}</div>}

          <div className="table-scroll">
            {items.length === 0 ? (
              <div className="empty">
                <CheckCircle2 size={24} />
                <strong>No {view.replace('_', ' ')} obligations are currently assigned.</strong>
                <span>
                  {canCreate
                    ? 'Click "New obligation" to add one.'
                    : 'Change the view or wait for the next lifecycle update.'}
                </span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Obligation</th>
                    <th>Owner</th>
                    <th>Due date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((obligation: any) => (
                    <tr key={obligation._id}>
                      <td>
                        <strong>{obligation.title}</strong>
                        <div style={{ color: '#8293a0', fontSize: 11, marginTop: 4 }}>
                          {obligation.type}
                          {obligation.contractId
                            ? ` · ${contracts.find((c) => c._id === obligation.contractId)?.title ?? obligation.contractId.slice(-6)}`
                            : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>
                          {ownerLabel(obligation.ownerId, users)}
                        </span>
                      </td>
                      <td>
                        <strong className={obligation.status === 'overdue' ? 'obligation-overdue' : ''}>
                          {obligation.dueDate ? new Date(obligation.dueDate).toLocaleDateString() : '—'}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge badge-${tone(obligation.priority)}`}>
                          {obligation.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${
                            obligation.status === 'completed'
                              ? 'green'
                              : obligation.status === 'overdue'
                              ? 'red'
                              : 'orange'
                          }`}
                        >
                          {obligation.status}
                        </span>
                      </td>
                      <td>
                        {obligation.status !== 'completed' && (
                          <button
                            className="btn btn-primary btn-compact"
                            disabled={busy === obligation._id}
                            onClick={() => void complete(obligation)}
                          >
                            <ClipboardCheck size={14} /> {busy === obligation._id ? 'Saving…' : 'Complete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TiltCard>
      </Reveal>

      {/* ── Create Obligation Modal ────────────────────────────────────── */}
      {showCreate && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,18,28,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCreate(false); setForm(EMPTY_FORM); setFormError(''); } }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 560, padding: 32, position: 'relative' }}>
            <button
              className="icon-button"
              style={{ position: 'absolute', top: 16, right: 16 }}
              onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(''); }}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="eyebrow" style={{ marginBottom: 6 }}><Sparkles size={12} /> New obligation</div>
            <h2 style={{ marginBottom: 4, fontSize: 20 }}>Create obligation</h2>
            <p className="subtitle" style={{ marginBottom: 24 }}>
              Track a commitment, deadline, or compliance deliverable against a contract.
            </p>

            <form onSubmit={(e) => void submitCreate(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label htmlFor="ob-contract">Contract <span style={{ color: 'var(--accent)' }}>*</span></label>
                <select
                  id="ob-contract"
                  required
                  value={form.contractId}
                  onChange={(e) => setForm((f) => ({ ...f, contractId: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="">— Select a contract —</option>
                  {contracts.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.contractNumber ? `${c.contractNumber} · ` : ''}{c.title ?? c._id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="ob-title">Title <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  id="ob-title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. Submit annual SOC2 audit report"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label htmlFor="ob-type">Type</label>
                  <select
                    id="ob-type"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    {OBLIGATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="ob-priority">Priority</label>
                  <select
                    id="ob-priority"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="ob-due">Due date <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  id="ob-due"
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>

              <div className="field">
                <label htmlFor="ob-desc">Description <span style={{ color: '#8293a0', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  id="ob-desc"
                  rows={3}
                  maxLength={4000}
                  placeholder="Additional details, acceptance criteria, or evidence requirements…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {formError && <div className="notice">{formError}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(''); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  <ClipboardCheck size={15} /> {creating ? 'Creating…' : 'Create obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
