import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2, Clock3, FileText, RefreshCw, Sparkles } from 'lucide-react';
import { endpoints } from '../services/api';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';
import { TiltCard, Reveal, useAnimatedNumber } from '../components/Motion';

const statusColors: Record<string, string> = {
  active: '#1d9365',
  draft: '#91a3af',
  review: '#e68a36',
  approval: '#5c82af',
  signature: '#875ab5',
  monitoring: '#2b9aa1',
  renewal: '#db6a4e',
  archived: '#9ca8b2',
};

function AnimatedKpi({ icon, label, numericValue, meta, tone = 'blue' }: { icon: React.ReactNode; label: string; numericValue: number; meta: string; tone?: string }) {
  const animated = useAnimatedNumber(numericValue, 850);
  const colorMap: Record<string, string> = {
    green: '#1d9365',
    orange: '#e68a36',
    red: '#be5a54',
    blue: '#5c82af',
  };

  return (
    <TiltCard className="card kpi-card" maxTilt={3.5}>
      <div style={{ color: colorMap[tone] ?? '#5c82af' }}>{icon}</div>
      <div className="kpi-label" style={{ marginTop: 14 }}>{label}</div>
      <div className="kpi-value">{animated.toLocaleString()}</div>
      <div className="kpi-meta" style={{ color: tone === 'red' ? '#be5a54' : undefined }}>{meta}</div>
    </TiltCard>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState<any>();
  const [contracts, setContracts] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([endpoints.dashboardSummary(), endpoints.dashboardContracts()])
      .then(([a, b]) => {
        setSummary(a);
        setContracts(b);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useRealtimeRefresh(['dashboard.updated', 'contract.updated', 'approval.updated', 'obligation.updated'], load);

  const status = summary?.contractsByLifecycleStatus ?? {};
  const total = summary?.totalContracts || 1;

  return (
    <>
      <Reveal direction="up" delay={20}>
        <div className="page-heading">
          <div>
            <div className="eyebrow"><Sparkles size={13} /> Enterprise command center</div>
            <h1>Good morning, your workspace is in motion.</h1>
            <p className="subtitle">A live view of contract health, approvals, obligations, and renewal exposure.</p>
          </div>
          <button className="btn btn-secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh data
          </button>
        </div>
      </Reveal>

      {error && <div className="notice" style={{ marginBottom: 18 }}>{error}</div>}

      {loading ? (
        <div className="card empty" style={{ padding: 40, textAlign: 'center' }}>
          <div className="loading-spinner-dot" style={{ margin: '0 auto 12px' }} />
          Loading dashboard intelligence…
        </div>
      ) : (
        <>
          <Reveal direction="up" delay={50}>
            <div className="kpi-grid">
              <AnimatedKpi
                icon={<FileText size={18} />}
                label="Total contracts"
                numericValue={summary?.totalContracts ?? 0}
                meta="Across this tenant"
                tone="blue"
              />
              <AnimatedKpi
                icon={<CheckCircle2 size={18} />}
                label="Active contracts"
                numericValue={summary?.activeContracts ?? 0}
                meta={`${Math.round(((summary?.activeContracts ?? 0) / total) * 100)}% of portfolio`}
                tone="green"
              />
              <AnimatedKpi
                icon={<Clock3 size={18} />}
                label="Pending approvals"
                numericValue={summary?.pendingApprovals ?? 0}
                meta="Needs attention"
                tone="orange"
              />
              <AnimatedKpi
                icon={<AlertTriangle size={18} />}
                label="Obligations overdue"
                numericValue={summary?.overdueObligations ?? 0}
                meta={`${summary?.complianceIndicators?.obligationCompliance ?? 100}% compliance`}
                tone="red"
              />
            </div>
          </Reveal>

          <Reveal direction="up" delay={80}>
            <div className="grid-2">
              <TiltCard className="card panel" maxTilt={2.5}>
                <div className="panel-header">
                  <div>
                    <h2>Contract lifecycle</h2>
                    <div className="panel-caption">Portfolio distribution by current state</div>
                  </div>
                  <BarChart3 size={20} color="#1d9365" />
                </div>
                <div className="status-list">
                  {Object.entries(status).map(([name, value]: any) => (
                    <div className="status-row" key={name}>
                      <span style={{ textTransform: 'capitalize' }}>{name}</span>
                      <div className="progress">
                        <span
                          style={{
                            width: `${Math.max(4, (value / total) * 100)}%`,
                            background: statusColors[name] ?? '#1d9365',
                            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </TiltCard>

              <TiltCard className="card panel" maxTilt={2.5}>
                <div className="panel-header">
                  <div>
                    <h2>Portfolio signals</h2>
                    <div className="panel-caption">Prioritized operating indicators</div>
                  </div>
                  <Activity size={20} color="#e68a36" />
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    ['Upcoming expirations', `${summary?.upcomingExpirations ?? 0}`, 'Within 90 days', 'orange'],
                    ['Total contract value', `$${Number(summary?.totalContractValue ?? 0).toLocaleString()}`, 'Portfolio exposure', 'green'],
                    ['Compliance score', `${summary?.complianceIndicators?.obligationCompliance ?? 100}%`, 'Obligation completion', 'blue'],
                  ].map(([label, value, caption, tone]) => (
                    <div
                      key={String(label)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 14,
                        borderBottom: '1px solid #edf1f3',
                      }}
                    >
                      <div>
                        <div style={{ color: '#657c8d', fontSize: 12 }}>{label}</div>
                        <div style={{ color: '#173149', fontWeight: 700, fontSize: 22, marginTop: 4 }}>{value}</div>
                      </div>
                      <span className={`badge badge-${tone}`}>{caption}</span>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </div>
          </Reveal>

          <Reveal direction="up" delay={110}>
            <TiltCard className="card table-card" maxTilt={1.5}>
              <div className="table-toolbar">
                <div>
                  <h2>Contract intelligence</h2>
                  <div className="panel-caption">{contracts?.contractsByType?.length ?? 0} tracked contract dimensions</div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    window.history.pushState({}, '', '/contracts');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  View contracts <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="empty" style={{ padding: 30 }}>
                Dashboard analytics are refreshed from the CovenX reporting read model. Use Contracts for searchable records and lifecycle actions.
              </div>
            </TiltCard>
          </Reveal>
        </>
      )}
    </>
  );
}
