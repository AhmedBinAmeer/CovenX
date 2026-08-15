import React from 'react';
import { RiskCategory } from '../../types/contract.types.js';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  category: RiskCategory | string;
  score?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ category, score }) => {
  const styles: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    CRITICAL: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const currentStyle = styles[category] || styles.LOW;
  const isHighRisk = category === 'HIGH' || category === 'CRITICAL';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {isHighRisk ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
      {category} {score !== undefined && `(${score})`}
    </span>
  );
};
