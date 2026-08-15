import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, Shield, User } from 'lucide-react';
import { Button } from '../ui/Button.js';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-brand-500" />
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Coven<span className="text-brand-500">X</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center font-medium">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Architect</span>
        </div>
      </div>
    </header>
  );
};
