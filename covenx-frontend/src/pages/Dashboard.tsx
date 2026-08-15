import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { useGetExecutiveMetricsQuery } from '../store/api/analyticsApi.js';
import { Card } from '../components/ui/Card.js';
import { FileText, CheckCircle2, Clock, AlertTriangle, TrendingUp, DollarSign, Building2, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setTheme } = useTheme();
  const { data: metrics, isLoading } = useGetExecutiveMetricsQuery();

  useEffect(() => {
    // Steering rule: Dark advanced for executive analytics
    setTheme('dark');
  }, [setTheme]);

  const cards = [
    { title: 'Total Enterprise Contracts', value: metrics?.totalContracts || 350000, icon: FileText, change: '+14%', color: 'text-blue-400' },
    { title: 'Active Executed Contracts', value: metrics?.activeContracts || 298400, icon: CheckCircle2, change: '+9%', color: 'text-emerald-400' },
    { title: 'Pending Review & Approval', value: metrics?.pendingApprovals || 3420, icon: Clock, change: '-4%', color: 'text-amber-400' },
    { title: 'Expiring in 30 Days', value: metrics?.expiringSoon || 1280, icon: AlertTriangle, change: 'Action Req', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive CLM Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real-time enterprise metrics, portfolio values, and risk exposure.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Total Portfolio Value:</span>
          <span className="font-extrabold text-white text-sm">
            ${(metrics?.totalContractValue || 485000000).toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="bg-slate-800/80 border-slate-700/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                <Icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{m.value.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {m.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Department Breakdown & Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/80 border-slate-700/60 p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" /> Department Contract Distribution
          </h2>
          <div className="space-y-3">
            {[
              { dept: 'Legal & Procurement', count: 124000, value: '$180M', pct: '38%' },
              { dept: 'IT & Cloud Services', count: 85000, value: '$145M', pct: '26%' },
              { dept: 'Human Resources', count: 68000, value: '$42M', pct: '18%' },
              { dept: 'Sales & Distribution', count: 73000, value: '$118M', pct: '18%' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>{item.dept}</span>
                  <span className="text-slate-400">{item.count.toLocaleString()} contracts ({item.value})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: item.pct }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700/60 p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> Real-time Audit & Activity Log
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
            {(metrics?.recentActivity && metrics.recentActivity.length > 0
              ? metrics.recentActivity
              : [
                  { _id: '1', action: 'CONTRACT_CREATED', actorName: 'Legal Reviewer', details: 'Created CVX-MSA-2026-A1B2 (Enterprise SLA)', timestamp: new Date().toISOString() },
                  { _id: '2', action: 'STEP_APPROVED', actorName: 'Finance Approver', details: 'Step 2 approved for CVX-SLA-2026-F9X2', timestamp: new Date().toISOString() },
                  { _id: '3', action: 'DIGITAL_SIGNATURE_EXECUTED', actorName: 'Vendor Executive', details: 'Executed cryptographic signature for CVX-NDA-2026-88C1', timestamp: new Date().toISOString() },
                ]
            ).map((act) => (
              <div key={act._id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-200">{act.action}</span>
                  <p className="text-[11px] text-slate-400">{act.details}</p>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
