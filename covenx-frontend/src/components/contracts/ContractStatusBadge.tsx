import React from 'react';
import { ContractStatus } from '../../types/contract.types.js';

interface StatusBadgeProps {
  status: ContractStatus | string;
}

export const ContractStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
    PENDING_REVIEW: 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border-ember-500/20',
    APPROVED: 'bg-navy-500/10 text-navy-600 dark:text-navy-300 border-navy-500/20',
    EXECUTED: 'bg-forest-500/10 text-forest-600 dark:text-forest-400 border-forest-500/20',
    TERMINATED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    EXPIRED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  const currentStyle = styles[status] || styles.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
};
