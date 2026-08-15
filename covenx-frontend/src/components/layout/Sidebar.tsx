import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FileEdit, BookOpen, LogIn } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Executive Analytics', icon: LayoutDashboard },
    { to: '/contracts', label: 'Contract Repository', icon: FileText },
    { to: '/editor', label: 'Authoring Studio', icon: FileEdit },
    { to: '/templates', label: 'Templates & Clauses', icon: BookOpen },
    { to: '/login', label: 'Auth & Roles', icon: LogIn },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors">
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 font-semibold'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-xs border border-gray-100 dark:border-slate-800">
        <p className="font-bold text-gray-800 dark:text-slate-200">EEF MS-347 Platform</p>
        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">350,000 Active Contracts Scale Architecture</p>
      </div>
    </aside>
  );
};
