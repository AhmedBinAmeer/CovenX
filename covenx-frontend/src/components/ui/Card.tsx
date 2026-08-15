import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
};
