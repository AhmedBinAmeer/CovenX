import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** 'default' | 'navy' | 'glass' — visual accent variant */
  variant?: 'default' | 'navy' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const base = 'rounded-xl shadow-sm transition-all';
  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-navy-800/60 p-5',
    navy:    'bg-navy-500 text-white border border-navy-600 p-5',
    glass:   'glass-card p-5',
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
