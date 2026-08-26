import { type ReactNode, useEffect, useState } from 'react';
import {
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Cable,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Command,
  FileCheck2,
  FileText,
  Gauge,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Workflow,
  Library,
  Scale,
  ScrollText,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../main';
import type { Capability } from '../utils/permissions';

const links: Array<{ path: string; label: string; icon: typeof Gauge; permission: Capability }> = [
  { path: '/', label: 'Overview', icon: Gauge, permission: 'report:read' },
  { path: '/intake', label: 'Intake portal', icon: FileText, permission: 'intake:create' },
  { path: '/integrations', label: 'Integrations', icon: Cable, permission: 'integration:read' },
  { path: '/contracts', label: 'Contracts', icon: FileText, permission: 'contract:read' },
  { path: '/approvals', label: 'Approvals', icon: ClipboardCheck, permission: 'approval:read' },
  { path: '/obligations', label: 'Obligations', icon: BriefcaseBusiness, permission: 'obligation:read' },
  { path: '/renewals', label: 'Renewals', icon: CalendarClock, permission: 'contract:read' },
  { path: '/documents', label: 'Documents', icon: FileCheck2, permission: 'document:read' },
  { path: '/intelligence', label: 'Intelligence', icon: BrainCircuit, permission: 'contract:read' },
  { path: '/notifications', label: 'Notifications', icon: Bell, permission: 'notification:read' },
  { path: '/templates', label: 'Templates', icon: Library, permission: 'template:read' },
  { path: '/clauses', label: 'Clauses', icon: Scale, permission: 'clause:read' },
  { path: '/workflows', label: 'Workflows', icon: Workflow, permission: 'workflow:read' },
  { path: '/users', label: 'Users', icon: Users, permission: 'user:read' },
  { path: '/audit', label: 'Audit log', icon: ScrollText, permission: 'audit:read' },
];

export function Layout({
  path,
  setPath,
  onLogout,
  children,
}: {
  path: string;
  setPath: (p: string) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const visibleLinks = links.filter((link) => !user?.permissions?.length || user.permissions.includes(link.permission));
  const display = user?.profile?.displayName ?? user?.email ?? 'Workspace user';
  const initials = display
    .split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const go = (p: string) => {
    window.history.pushState({}, '', p);
    setPath(p);
    setMenuOpen(false);
    setPaletteOpen(false);
    setPaletteQuery('');
  };

  const paletteItems = visibleLinks
    .concat([{ path: '/contracts/new', label: 'New contract', icon: FileText, permission: 'contract:create' as Capability }])
    .filter((item) => !paletteQuery.trim() || item.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${menuOpen ? 'visible' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="brand brand-button" onClick={() => go('/')} aria-label="CovenX overview">
          <div className="brand-badge" style={{ width: 38, height: 38, borderRadius: 10 }}>
            <img className="brand-badge-logo" src="/covenx-logo-transparent.png" alt="CovenX" style={{ width: 28, height: 28 }} />
          </div>
          <span className="brand-copy">
            <strong>CovenX</strong>
            <small>Enterprise CLM</small>
          </span>
        </button>

        <div className="nav-label">Workspace</div>
        <nav className="nav-group">
          {visibleLinks.map(({ path: itemPath, label, icon: Icon }) => (
            <button
              key={itemPath}
              className={`nav-item ${path === itemPath ? 'active' : ''}`}
              onClick={() => go(itemPath)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="nav-label">Administration</div>
        <button
          className={`nav-item ${path === '/settings' ? 'active' : ''}`}
          onClick={() => go('/settings')}
        >
          <SettingsIcon size={17} />
          <span>Settings</span>
        </button>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {display}
              </div>
              <div style={{ color: '#7893a8', fontSize: 10, marginTop: 3 }}>Enterprise workspace</div>
            </div>
            <button
              aria-label="Sign out"
              className="icon-button"
              onClick={onLogout}
              style={{ marginLeft: 'auto', background: 'transparent', borderColor: 'transparent', color: '#92aabd' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button className="hamburger-btn" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="breadcrumb">
              <span>CovenX</span>
              <ChevronRight size={14} style={{ verticalAlign: 'middle', margin: '0 6px' }} />
              <strong>{visibleLinks.find((x) => x.path === path)?.label ?? 'Settings'}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div className="badge badge-green live-indicator">
              <Sparkles size={12} /> Live workspace
            </div>
            <button className="icon-button command-trigger" aria-label="Open command palette" onClick={() => setPaletteOpen(true)}>
              <Command size={16} />
              <span className="shortcut-hint">Ctrl K</span>
            </button>
            <button className="icon-button" aria-label="Notifications" onClick={() => go('/notifications')}>
              <Bell size={17} />
            </button>
          </div>
        </header>

        <div className="content">{children}</div>

        {paletteOpen && (
          <div className="command-backdrop" role="presentation" onClick={() => setPaletteOpen(false)}>
            <section
              className="command-palette"
              role="dialog"
              aria-modal="true"
              aria-label="CovenX command palette"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="command-search">
                <Search size={17} />
                <input
                  autoFocus
                  value={paletteQuery}
                  onChange={(event) => setPaletteQuery(event.target.value)}
                  placeholder="Search workspace or quick action"
                />
              </div>
              <div className="command-list">
                {paletteItems.map(({ path: itemPath, label, icon: Icon }) => (
                  <button key={itemPath} className="command-item" onClick={() => go(itemPath)}>
                    <Icon size={16} />
                    <span>{label}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
                {paletteItems.length === 0 && <div className="empty">No matching workspace actions.</div>}
              </div>
              <div className="command-footer">
                Press <kbd>Esc</kbd> to close · <kbd>Ctrl K</kbd> to toggle
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
