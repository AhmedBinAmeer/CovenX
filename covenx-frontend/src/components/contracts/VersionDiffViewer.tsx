import React, { useState } from 'react';
import { IVersionRecord } from '../../types/contract.types.js';
import { GitCompare, History } from 'lucide-react';

interface VersionDiffViewerProps {
  history: IVersionRecord[];
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({ history }) => {
  const [selectedVer, setSelectedVer] = useState<string>(history[history.length - 1]?.version || '1.0');

  const selectedRecord = history.find((h) => h.version === selectedVer) || history[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-brand-500" /> Revision History & Diff Inspection
        </h3>

        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <select
            value={selectedVer}
            onChange={(e) => setSelectedVer(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none"
          >
            {history.map((h) => (
              <option key={h.version} value={h.version}>
                v{h.version} - {h.changeSummary}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRecord && (
        <div className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-slate-700 pb-2">
            <span className="font-semibold text-brand-600 dark:text-brand-400">Revision Version {selectedRecord.version}</span>
            <span className="text-gray-500 dark:text-slate-400">
              Updated by {selectedRecord.updatedBy} on {new Date(selectedRecord.updatedAt).toLocaleString()}
            </span>
          </div>

          <div className="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/60 p-3 rounded-lg border border-gray-100 dark:border-slate-800 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            {selectedRecord.content}
          </div>
        </div>
      )}
    </div>
  );
};
