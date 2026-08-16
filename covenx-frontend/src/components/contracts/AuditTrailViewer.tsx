import React from 'react';
import { IAuditLog } from '../../types/contract.types.js';
import { Activity, User, Shield } from 'lucide-react';

interface AuditTrailViewerProps {
  logs: IAuditLog[];
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
        <Activity className="w-4 h-4 text-ember-500" /> Immutable Audit Logs & Event Trail
      </h3>

      <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="p-4 text-xs text-gray-400 text-center">No audit logs recorded for this contract yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-3 text-xs flex items-start justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-ember-500/10 text-ember-600 dark:text-ember-400 font-bold uppercase text-[10px]">
                    {log.action}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" /> {log.actorName} ({log.actorRole})
                  </span>
                </div>
                <p className="text-gray-600 dark:text-slate-300">{log.details}</p>
              </div>

              <div className="text-right text-[10px] text-gray-400 space-y-0.5">
                <p>{new Date(log.timestamp).toLocaleString()}</p>
                <p className="font-mono flex items-center justify-end gap-1"><Shield className="w-2.5 h-2.5" /> IP: {log.ipAddress || '127.0.0.1'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
