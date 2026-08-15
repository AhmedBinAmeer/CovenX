import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, Shield, Bell, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user || { name: 'Lead Architect', role: 'ADMIN', email: 'architect@covenx.io' };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Coven<span className="text-brand-500">X</span>
          </span>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-500 uppercase">
            CLM Enterprise
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          title="Toggle Theme Mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-4 border-l border-gray-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
