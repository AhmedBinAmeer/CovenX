import React from 'react';
import { IClause } from '../../types/contract.types.js';
import { BookOpen, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ClauseLibraryDrawerProps {
  clauses: IClause[];
  onInsertClause: (clauseText: string) => void;
}

export const ClauseLibraryDrawer: React.FC<ClauseLibraryDrawerProps> = ({ clauses, onInsertClause }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-forest-500" /> Clause Library
        </h3>
        <span className="text-xs text-gray-500">{clauses.length} Verified Clauses</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {clauses.map((clause) => (
          <div key={clause._id} className="p-3 border border-gray-100 dark:border-slate-700/80 rounded-lg hover:border-forest-500/50 transition-colors space-y-2 bg-gray-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{clause.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-500/10 text-navy-600 dark:text-navy-300 font-semibold">
                {clause.category}
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-mono">
              {clause.body}
            </p>

            <Button
              size="sm"
              variant="secondary"
              className="w-full text-xs"
              onClick={() => onInsertClause(`\n\n[CLAUSE: ${clause.title}]\n${clause.body}`)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Insert Clause into Contract
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
