import React, { useState } from 'react';
import { IObligation } from '../../types/contract.types.js';
import { Calendar, CheckSquare, Plus } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ObligationsProps {
  obligations: IObligation[];
  onAddObligation?: (data: { title: string; ownerName: string; dueDate: string; type: string }) => void;
}

export const ObligationsTable: React.FC<ObligationsProps> = ({ obligations, onAddObligation }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('SLA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddObligation && title && ownerName && dueDate) {
      onAddObligation({ title, ownerName, dueDate, type });
      setTitle('');
      setOwnerName('');
      setDueDate('');
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-brand-500" /> Post-Signature Obligations & SLA Deadlines
        </h3>
        {onAddObligation && (
          <Button size="sm" variant="secondary" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Obligation
          </Button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            required
            placeholder="Obligation Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            required
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
          <Button type="submit" size="sm" variant="primary">Save Obligation</Button>
        </form>
      )}

      <div className="overflow-x-auto bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="p-3">Obligation Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
            {obligations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">No obligations registered yet.</td>
              </tr>
            ) : (
              obligations.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{item.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-slate-300">{item.ownerName}</td>
                  <td className="p-3 text-gray-600 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" /> {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
