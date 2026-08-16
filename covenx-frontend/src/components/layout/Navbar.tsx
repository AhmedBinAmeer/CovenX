import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, Bell, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user || { name: 'Lead Architect', role: 'ADMIN', email: 'architect@covenx.io' };

  return (
    <header className="h-[4.5rem] border-b border-navy-100 dark:border-navy-900 bg-white/90 dark:bg-[#0c101a]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-colors shadow-brand-sm">
      {/* CovenX Logo */}
      <div className="flex items-center gap-3">
        {/* Light mode: mix-blend-mode:multiply removes the white logo bg */}
        {/* Dark mode: white rounded pill keeps logo visible on dark surface */}
        <img
          src="/logo.png"
          alt="CovenX Logo"
          className="h-12 w-auto object-contain [mix-blend-mode:multiply] dark:[mix-blend-mode:normal] dark:bg-white dark:rounded-xl dark:p-1"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ember-500/10 text-ember-600 dark:text-ember-400 uppercase tracking-wider">
          CLM Enterprise
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-navy-400 hover:text-navy-600 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors hover:bg-navy-50 dark:hover:bg-navy-900/40"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-navy-400 hover:text-navy-600 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors hover:bg-navy-50 dark:hover:bg-navy-900/40">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ember-500 animate-pulse-slow"></span>
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-navy-100 dark:border-navy-800">
          <div className="w-8 h-8 rounded-full gradient-navy-ember flex items-center justify-center shadow-brand-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-[10px] font-bold text-forest-600 dark:text-forest-400">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
