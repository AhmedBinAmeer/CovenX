import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'green' | 'ember';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    // Navy blue — primary CTA
    primary: 'bg-navy-500 hover:bg-navy-600 text-white shadow-brand-sm hover:shadow-brand-md focus:ring-navy-400',
    // Slate secondary
    secondary: 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white focus:ring-navy-300',
    // Danger
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    // Ghost
    ghost: 'bg-transparent hover:bg-navy-50 dark:hover:bg-navy-900/40 text-navy-600 dark:text-slate-300',
    // Forest green accent
    green: 'bg-forest-500 hover:bg-forest-600 text-white shadow-forest-sm focus:ring-forest-400',
    // Ember orange accent
    ember: 'bg-ember-500 hover:bg-ember-600 text-white shadow-ember-sm focus:ring-ember-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
