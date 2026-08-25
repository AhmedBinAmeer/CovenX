import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { endpoints, setAccessToken } from './services/api';
import { connectRealtime } from './services/realtime';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Contracts } from './pages/Contracts';
import { Approvals } from './pages/Approvals';
import { Obligations } from './pages/Obligations';
import { Documents } from './pages/Documents';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import './index.css';

type AuthState = { user: any | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);
function App() { const [user, setUser] = useState<any | null>(null); const [loading, setLoading] = useState(true); const [path, setPath] = useState(window.location.pathname || '/'); useEffect(() => { endpoints.me().then((v) => setUser(v.user ?? v)).catch(() => setUser(null)).finally(() => setLoading(false)); const onPop = () => setPath(window.location.pathname); addEventListener('popstate', onPop); return () => removeEventListener('popstate', onPop); }, []); useEffect(() => { if (!user) return; const socket = connectRealtime((event, payload) => window.dispatchEvent(new CustomEvent('covenx:realtime', { detail: { event, payload } }))); return () => { socket?.disconnect(); }; }, [user]); const value = useMemo<AuthState>(() => ({ user, loading, login: async (email, password) => { const result = await endpoints.login({ email, password }); setAccessToken(result.accessToken); setUser(result.user); navigate('/'); }, logout: () => { setAccessToken(null); setUser(null); navigate('/login'); } }), [user, loading]); const navigate = (next: string) => { window.history.pushState({}, '', next); setPath(next); }; return <AuthContext.Provider value={value}>{loading ? <div className="empty">Loading CovenX workspace…</div> : !user ? <Login /> : <Layout path={path} setPath={navigate} onLogout={value.logout}><Page path={path} /></Layout>}</AuthContext.Provider>; }
function Page({ path }: { path: string }) { if (path === '/contracts') return <Contracts />; if (path === '/approvals') return <Approvals />; if (path === '/obligations') return <Obligations />; if (path === '/documents') return <Documents />; if (path === '/notifications') return <Notifications />; if (path === '/settings') return <Settings />; return <Dashboard />; }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
