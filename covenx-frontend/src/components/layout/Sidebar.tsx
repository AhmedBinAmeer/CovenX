import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FileEdit, BookOpen, LogIn } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard',  label: 'Executive Analytics', icon: LayoutDashboard, accent: 'ember'  },
    { to: '/contracts',  label: 'Contract Repository',  icon: FileText,         accent: 'navy'   },
    { to: '/editor',     label: 'Authoring Studio',     icon: FileEdit,         accent: 'forest' },
    { to: '/templates',  label: 'Templates & Clauses',  icon: BookOpen,         accent: 'navy'   },
    { to: '/login',      label: 'Auth & Roles',         icon: LogIn,            accent: 'ember'  },
  ];

  const activeAccent: Record<string, string> = {
    ember:  'bg-ember-500 text-white shadow-ember-sm',
    navy:   'bg-navy-500 text-white shadow-brand-sm',
    forest: 'bg-forest-500 text-white shadow-forest-sm',
  };

  return (
    <aside className="w-64 border-r border-navy-100 dark:border-navy-900 bg-white dark:bg-[#0c101a] min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? `${activeAccent[item.accent]} font-semibold`
                    : 'text-navy-500 dark:text-slate-400 hover:bg-navy-50 dark:hover:bg-navy-900/40 hover:text-navy-700 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer badge */}
      <div className="p-3.5 rounded-xl text-xs border gradient-navy-green text-white/90">
        <p className="font-bold">CovenX CLM Platform</p>
        <p className="text-[11px] text-white/60 mt-0.5">350K Active Contracts · Enterprise Scale</p>
      </div>
    </aside>
  );
};
