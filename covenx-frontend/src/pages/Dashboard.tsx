import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Card } from '../components/ui/Card.js';
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Steering rule: Dark advanced for analytics
    setTheme('dark');
  }, [setTheme]);

  const metrics = [
    { title: 'Total Contracts', value: '142', icon: FileText, change: '+12%', color: 'text-blue-400' },
    { title: 'Approved', value: '98', icon: CheckCircle, change: '+8%', color: 'text-emerald-400' },
    { title: 'Pending Review', value: '34', icon: Clock, change: '-3%', color: 'text-amber-400' },
    { title: 'Rejected', value: '10', icon: AlertTriangle, change: '0%', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Contract Analytics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time metrics, audit logs, and performance tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="bg-slate-800/80 border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{m.title}</span>
                <Icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{m.value}</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {m.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-slate-800/80 border-slate-700/60 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Executed Contracts</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div>
                <h3 className="font-medium text-slate-200">Enterprise SLA Agreement v{item}.0</h3>
                <p className="text-xs text-slate-400">Updated 2 hours ago by System Architect</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EXECUTED
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
