import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileEdit, LogIn } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { to: '/editor', label: 'Contract Editor', icon: FileEdit },
    { to: '/login', label: 'Login', icon: LogIn },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-xs text-gray-500 dark:text-slate-400">
        <p className="font-semibold text-gray-700 dark:text-slate-300">Hybrid Theme Active</p>
        <p className="mt-1">Light for authoring, Dark for analytics.</p>
      </div>
    </aside>
  );
};
