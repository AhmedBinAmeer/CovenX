import React from 'react';
import { useGetExecutiveMetricsQuery } from '../store/api/analyticsApi.js';
import { Card } from '../components/ui/Card.js';
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, DollarSign, Building2, Activity,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: metrics } = useGetExecutiveMetricsQuery();

  const cards = [
    {
      title: 'Total Enterprise Contracts',
      value: metrics?.totalContracts || 350_000,
      icon: FileText,
      change: '+14%',
      positive: true,
      iconBg: 'bg-navy-100 dark:bg-navy-500/20',
      iconColor: 'text-navy-600 dark:text-navy-300',
    },
    {
      title: 'Active Executed Contracts',
      value: metrics?.activeContracts || 298_400,
      icon: CheckCircle2,
      change: '+9%',
      positive: true,
      iconBg: 'bg-forest-100 dark:bg-forest-500/20',
      iconColor: 'text-forest-600 dark:text-forest-400',
    },
    {
      title: 'Pending Review & Approval',
      value: metrics?.pendingApprovals || 3_420,
      icon: Clock,
      change: '-4%',
      positive: false,
      iconBg: 'bg-ember-100 dark:bg-ember-500/20',
      iconColor: 'text-ember-600 dark:text-ember-400',
    },
    {
      title: 'Expiring in 30 Days',
      value: metrics?.expiringSoon || 1_280,
      icon: AlertTriangle,
      change: 'Action Req',
      positive: false,
      iconBg: 'bg-red-100 dark:bg-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Executive <span className="text-ember-500">CLM</span> Analytics
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            Real-time enterprise metrics, portfolio values, and risk exposure.
          </p>
        </div>

        {/* Portfolio value badge */}
        <div className="flex items-center gap-3 bg-navy-50 dark:bg-navy-500/20 border border-navy-200 dark:border-navy-500/30 px-4 py-2.5 rounded-xl text-xs">
          <DollarSign className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          <span className="text-gray-600 dark:text-slate-300">Total Portfolio Value:</span>
          <span className="font-extrabold text-gray-900 dark:text-white text-sm">
            ${(metrics?.totalContractValue || 485_000_000).toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-navy-800/60 rounded-xl p-5 shadow-sm hover:shadow-brand-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 leading-snug">{m.title}</span>
                <div className={`p-2 rounded-lg ${m.iconBg} shrink-0`}>
                  <Icon className={`w-4 h-4 ${m.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{m.value.toLocaleString()}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${m.positive ? 'text-forest-600 dark:text-forest-400' : 'text-ember-600 dark:text-ember-400'}`}>
                  <TrendingUp className="w-3 h-3" /> {m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Breakdown & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department bar chart */}
        <div className="bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-navy-800/60 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-ember-500" /> Department Contract Distribution
          </h2>
          <div className="space-y-3">
            {[
              { dept: 'Legal & Procurement', count: 124_000, value: '$180M', pct: 38, color: 'bg-navy-500' },
              { dept: 'IT & Cloud Services',  count: 85_000,  value: '$145M', pct: 26, color: 'bg-forest-500' },
              { dept: 'Human Resources',      count: 68_000,  value: '$42M',  pct: 18, color: 'bg-ember-500' },
              { dept: 'Sales & Distribution', count: 73_000,  value: '$118M', pct: 18, color: 'bg-navy-400' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-slate-300">
                  <span>{item.dept}</span>
                  <span className="text-gray-500 dark:text-slate-500">{item.count.toLocaleString()} ({item.value})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className="bg-white dark:bg-slate-900/70 border border-gray-200 dark:border-navy-800/60 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-forest-500" /> Real-time Audit & Activity Log
          </h2>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
            {(
              metrics?.recentActivity && metrics.recentActivity.length > 0
                ? metrics.recentActivity
                : [
                    { _id: '1', action: 'CONTRACT_CREATED',           actorName: 'Legal Reviewer',   details: 'Created CVX-MSA-2026-A1B2 (Enterprise SLA)',            timestamp: new Date().toISOString() },
                    { _id: '2', action: 'STEP_APPROVED',              actorName: 'Finance Approver',  details: 'Step 2 approved for CVX-SLA-2026-F9X2',                timestamp: new Date().toISOString() },
                    { _id: '3', action: 'DIGITAL_SIGNATURE_EXECUTED', actorName: 'Vendor Executive',  details: 'Executed cryptographic signature for CVX-NDA-2026-88C1', timestamp: new Date().toISOString() },
                  ]
            ).map((act, i) => {
              const pillColors = [
                'bg-navy-100 dark:bg-navy-500/20 text-navy-700 dark:text-navy-300',
                'bg-forest-100 dark:bg-forest-500/20 text-forest-700 dark:text-forest-300',
                'bg-ember-100 dark:bg-ember-500/20 text-ember-700 dark:text-ember-300',
              ];
              return (
                <div key={act._id} className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${pillColors[i % 3]} mb-1`}>
                      {act.action}
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{act.details}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">{new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
