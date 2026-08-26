import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { endpoints, getAccessToken, setAccessToken } from './services/api';
import { connectRealtime } from './services/realtime';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Contracts } from './pages/Contracts';
import { Approvals } from './pages/Approvals';
import { Obligations } from './pages/Obligations';
import { Documents } from './pages/Documents';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { ContractCreate } from './pages/ContractCreate';
import { ContractDetail } from './pages/ContractDetail';
import { Intelligence } from './pages/Intelligence';
import { Governance } from './pages/Governance';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { hasCapability } from './utils/permissions';
import type { Capability } from './utils/permissions';
import type { User } from './services/types';
import './index.css';

type AuthState = { user: any | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);
function App() { const [user, setUser] = useState<any | null>(null); const [loading, setLoading] = useState(true); const [path, setPath] = useState(window.location.pathname || '/'); useEffect(() => { if (!getAccessToken()) { setLoading(false); return; } endpoints.me().then((v) => setUser({ ...v.user, roles: v.roles, permissions: v.permissions })).catch(() => setUser(null)).finally(() => setLoading(false)); const onPop = () => setPath(window.location.pathname); addEventListener('popstate', onPop); return () => removeEventListener('popstate', onPop); }, []); useEffect(() => { if (!user) return; const socket = connectRealtime((event, payload) => window.dispatchEvent(new CustomEvent('covenx:realtime', { detail: { event, payload } }))); return () => { socket?.disconnect(); }; }, [user]); const value = useMemo<AuthState>(() => ({ user, loading, login: async (email, password) => { const result = await endpoints.login({ email, password }); setAccessToken(result.accessToken); setUser(result.user); navigate('/'); }, logout: () => { setAccessToken(null); setUser(null); navigate('/login'); } }), [user, loading]); const navigate = (next: string) => { window.history.pushState({}, '', next); setPath(next); }; return <AuthContext.Provider value={value}>{loading ? <div className="empty">Loading CovenX workspace…</div> : !user ? <Login /> : <Layout path={path} setPath={navigate} onLogout={value.logout}><Page path={path} navigate={navigate} user={user} /></Layout>}</AuthContext.Provider>; }
function Page({ path, navigate, user }: { path: string; navigate: (next: string) => void; user: User }) { const required: Array<[string, Capability]> = [['/', 'report:read'], ['/contracts', 'contract:read'], ['/contracts/new', 'contract:create'], ['/approvals', 'approval:read'], ['/obligations', 'obligation:read'], ['/documents', 'document:read'], ['/intelligence', 'contract:read'], ['/notifications', 'notification:read'], ['/templates', 'template:read'], ['/clauses', 'clause:read'], ['/workflows', 'workflow:read'], ['/users', 'user:read'], ['/audit', 'audit:read']]; const matched = required.find(([route]) => route === path); if (matched && !hasCapability(user, matched[1])) return <NotFound navigate={navigate} denied />; if (path.startsWith('/contracts/') && !hasCapability(user, 'contract:read')) return <NotFound navigate={navigate} denied />; const contractDetail = path.match(/^\/contracts\/([^/]+)$/); if (path === '/contracts/new') return <ContractCreate navigate={navigate} />; if (contractDetail) return <ContractDetail id={contractDetail[1]} navigate={navigate} />; if (path === '/contracts') return <Contracts navigate={navigate} />; if (path === '/approvals') return <Approvals />; if (path === '/obligations') return <Obligations />; if (path === '/documents') return <Documents />; if (path === '/intelligence') return <Intelligence />; if (path === '/notifications') return <Notifications />; if (path === '/') return <Dashboard />; if (path === '/settings') return <Settings />; if (path === '/templates') return <Governance section="templates" />; if (path === '/clauses') return <Governance section="clauses" />; if (path === '/workflows') return <Governance section="workflows" />; if (path === '/users') return <Governance section="users" />; if (path === '/audit') return <Governance section="audit" />; return <NotFound navigate={navigate} />; }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
