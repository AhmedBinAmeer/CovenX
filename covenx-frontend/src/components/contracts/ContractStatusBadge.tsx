import React from 'react';
import { ContractStatus } from '../../types/contract.types.js';

interface StatusBadgeProps {
  status: ContractStatus | string;
}

export const ContractStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
    PENDING_REVIEW: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    APPROVED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    EXECUTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    TERMINATED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    EXPIRED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const currentStyle = styles[status] || styles.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
};
