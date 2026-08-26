import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Download, FilePlus2, Filter, Search, Sparkles, X } from 'lucide-react';
import { endpoints } from '../services/api';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';
import { TiltCard, Reveal } from '../components/Motion';

type SavedView = { id: string; name: string; q: string; status: string; contractType: string };
const VIEW_KEY = 'covenx_saved_contract_views';
const statuses = ['draft', 'review', 'approval', 'signature', 'active', 'monitoring', 'renewal', 'archived'];

function readViews(): SavedView[] {
  try {
    return JSON.parse(localStorage.getItem(VIEW_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function exportCsv(items: any[]) {
  const headers = ['Contract number', 'Title', 'Type', 'Status', 'Expiry date', 'Value'];
  const rows = items.map((item) => [
    item.contractNumber ?? '',
    item.title ?? '',
    item.contractType ?? '',
    item.status ?? '',
    item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : '',
    item.financial?.value ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `covenx-contracts-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Contracts({ navigate }: { navigate: (path: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [contractType, setContractType] = useState('');
  const [views, setViews] = useState<SavedView[]>(readViews);
  const [viewName, setViewName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(
    () =>
      new URLSearchParams({
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(contractType ? { contractType } : {}),
        limit: '100',
      }).toString(),
    [q, status, contractType]
  );

  const load = async (nextQuery = query) => {
    setLoading(true);
    setError('');
    try {
      const data: any = await endpoints.contracts(nextQuery);
      setItems(Array.isArray(data) ? data : (data && (data.items || data.data)) || []);
      setSelected([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [query]);
  useRealtimeRefresh(['contract.updated'], () => load());

  const clearFilters = () => {
    setQ('');
    setStatus('');
    setContractType('');
  };
  const toggleSelected = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  const allSelected = items.length > 0 && items.every((item) => selected.includes(item._id ?? item.id));
  const toggleAll = () => setSelected(allSelected ? [] : items.map((item) => item._id ?? item.id));

  const saveView = (event: FormEvent) => {
    event.preventDefault();
    const name = viewName.trim();
    if (!name) return;
    const next = [
      ...views.filter((view) => view.name.toLowerCase() !== name.toLowerCase()),
      { id: crypto.randomUUID(), name, q, status, contractType },
    ];
    setViews(next);
    localStorage.setItem(VIEW_KEY, JSON.stringify(next));
    setViewName('');
  };

  const applyView = (view: SavedView) => {
    setQ(view.q);
    setStatus(view.status);
    setContractType(view.contractType);
  };
  const removeView = (id: string) => {
    const next = views.filter((view) => view.id !== id);
    setViews(next);
    localStorage.setItem(VIEW_KEY, JSON.stringify(next));
  };
  const selectedItems = items.filter((item) => selected.includes(item._id ?? item.id));

  return (
    <>
      <Reveal direction="up" delay={20}>
        <div className="page-heading">
          <div>
            <div className="eyebrow"><Sparkles size={13} /> Contract operations</div>
            <h1>Contracts</h1>
            <p className="subtitle">Search, segment, and move agreements through the full lifecycle.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/contracts/new')}>
            <FilePlus2 size={16} /> New contract
          </button>
        </div>
      </Reveal>

      <Reveal direction="up" delay={50}>
        <div className="contract-command-bar">
          <form
            className="search contract-search"
            onSubmit={(event) => {
              event.preventDefault();
              void load();
            }}
          >
            <Search size={16} />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search number, title, party, or type"
              aria-label="Search contracts"
            />
            <kbd>⌘ K</kbd>
          </form>
          <button
            className={`btn btn-secondary ${filtersOpen ? 'is-active' : ''}`}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <Filter size={15} /> Filters{' '}
            {status || contractType ? (
              <span className="filter-count">{Number(Boolean(status)) + Number(Boolean(contractType))}</span>
            ) : null}
          </button>
          <button
            className="btn btn-secondary"
            disabled={!selectedItems.length}
            onClick={() => exportCsv(selectedItems)}
          >
            <Download size={15} /> Export {selectedItems.length ? `(${selectedItems.length})` : ''}
          </button>
        </div>
      </Reveal>

      {filtersOpen && (
        <Reveal direction="scale" delay={20}>
          <div className="card filter-drawer">
            <div className="filter-drawer-header">
              <div>
                <strong>Portfolio filters</strong>
                <span>Build a focused operating view for this workspace.</span>
              </div>
              <button className="icon-button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="filter-grid">
              <div className="field">
                <label htmlFor="contract-status">Lifecycle status</label>
                <select id="contract-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">All statuses</option>
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="contract-type">Contract type</label>
                <input
                  id="contract-type"
                  value={contractType}
                  onChange={(event) => setContractType(event.target.value)}
                  placeholder="e.g. MSA, NDA, SOW"
                />
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-secondary" onClick={clearFilters} type="button">
                Clear filters
              </button>
              <span>{items.length} records in current result</span>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal direction="up" delay={80}>
        <div className="saved-view-strip">
          <div className="saved-view-label">
            <Bookmark size={14} /> Saved views
          </div>
          {views.map((view) => (
            <div className="saved-view-chip" key={view.id}>
              <button onClick={() => applyView(view)}>{view.name}</button>
              <button aria-label={`Delete ${view.name} saved view`} onClick={() => removeView(view.id)}>
                <X size={12} />
              </button>
            </div>
          ))}
          <form className="save-view-form" onSubmit={saveView}>
            <input
              aria-label="Saved view name"
              value={viewName}
              onChange={(event) => setViewName(event.target.value)}
              placeholder="Save current view as…"
            />
            <button className="icon-button" aria-label="Save current view" disabled={!viewName.trim()}>
              <Check size={14} />
            </button>
          </form>
        </div>
      </Reveal>

      <Reveal direction="up" delay={110}>
        <TiltCard className="card table-card" maxTilt={1.2}>
          <div className="table-toolbar">
            <div>
              <h2>Contract portfolio</h2>
              <div className="panel-caption">
                {loading ? 'Refreshing tenant-scoped records…' : `${items.length} records · ${selected.length} selected`}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh results'}
            </button>
          </div>
          {error && (
            <div className="notice" style={{ margin: 18 }}>
              {error}
            </div>
          )}
          <div className="table-scroll">
            {loading ? (
              <div className="portfolio-skeleton" aria-label="Loading contract records">
                <i />
                <i />
                <i />
                <i />
              </div>
            ) : items.length === 0 ? (
              <div className="empty">
                <strong>No contracts match this view.</strong>
                <span>Try clearing a filter or create a new agreement.</span>
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="select-cell">
                      <input
                        type="checkbox"
                        aria-label="Select all contracts"
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Contract</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Value</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => {
                    const id = item._id ?? item.id;
                    return (
                      <tr key={id}>
                        <td className="select-cell">
                          <input
                            type="checkbox"
                            aria-label={`Select ${item.contractNumber ?? 'contract'}`}
                            checked={selected.includes(id)}
                            onChange={() => toggleSelected(id)}
                          />
                        </td>
                        <td>
                          <button className="table-link" onClick={() => navigate(`/contracts/${id}`)}>
                            <strong>{item.contractNumber ?? 'Unnumbered'}</strong>
                            <span>{item.title ?? 'Untitled agreement'}</span>
                          </button>
                        </td>
                        <td>{item.contractType ?? '—'}</td>
                        <td>{item.ownerId ?? 'Assigned owner'}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              item.status === 'active' ? 'green' : item.status === 'approval' ? 'orange' : 'slate'
                            }`}
                          >
                            {item.status ?? 'draft'}
                          </span>
                        </td>
                        <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</td>
                        <td>{item.financial?.value ? `$${Number(item.financial.value).toLocaleString()}` : '—'}</td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Open ${item.contractNumber ?? 'contract'}`}
                            onClick={() => navigate(`/contracts/${id}`)}
                          >
                            <ArrowUpRight size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TiltCard>
      </Reveal>
    </>
  );
}
