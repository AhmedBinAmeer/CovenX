import React from 'react';
import { IDetectedRisk, RiskCategory } from '../../types/contract.types.js';
import { ShieldAlert, Sparkles, Lightbulb } from 'lucide-react';
import { RiskBadge } from '../contracts/RiskBadge.js';

interface RiskAnalysisPanelProps {
  score: number;
  category: RiskCategory;
  risks: IDetectedRisk[];
}

export const RiskAnalysisPanel: React.FC<RiskAnalysisPanelProps> = ({ score, category, risks }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> AI Risk Scoring & Highlights
        </h3>
        <RiskBadge category={category} score={score} />
      </div>

      <div className="space-y-3">
        {risks.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-500/10 rounded-lg">
            ✓ Low risk contract draft. No critical liability exposure or missing indemnity clauses detected.
          </p>
        ) : (
          risks.map((risk, idx) => (
            <div key={idx} className="p-3 border border-rose-100 dark:border-rose-900/30 rounded-lg bg-rose-500/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {risk.clauseTitle}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 font-bold">
                  {risk.severity}
                </span>
              </div>

              <p className="text-gray-700 dark:text-slate-300">{risk.description}</p>

              <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded">
                <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
                <span><strong>Recommendation:</strong> {risk.recommendation}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
