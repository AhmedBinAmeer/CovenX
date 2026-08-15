import React, { useState } from 'react';
import { useGetTemplatesQuery, useGetClausesQuery, useCreateClauseMutation } from '../store/api/templatesApi.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { BookOpen, FileText, Plus, ShieldCheck } from 'lucide-react';

export const Templates: React.FC = () => {
  const { data: templates = [] } = useGetTemplatesQuery();
  const { data: clauses = [] } = useGetClausesQuery();
  const [createClause] = useCreateClauseMutation();

  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'CLAUSES'>('TEMPLATES');
  const [showAddClause, setShowAddClause] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Indemnification');
  const [body, setBody] = useState('');
  const [riskRating, setRiskRating] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  const handleAddClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && body) {
      await createClause({ title, category, body, riskRating, isMandatory: false });
      setTitle('');
      setBody('');
      setShowAddClause(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Templates & Clause Library</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Centralized repository of verified contract templates and legally approved clauses.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'TEMPLATES' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('TEMPLATES')}
          >
            <FileText className="w-4 h-4 mr-1.5" /> Contract Templates ({templates.length})
          </Button>

          <Button
            variant={activeTab === 'CLAUSES' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('CLAUSES')}
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> Clause Library ({clauses.length})
          </Button>
        </div>
      </div>

      {activeTab === 'TEMPLATES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((t) => (
            <Card key={t._id} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" /> {t.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {t.category}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300">{t.description}</p>

              <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-lg border border-gray-200 dark:border-slate-800 font-mono text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {t.content}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[10px] font-semibold text-gray-400">Placeholders:</span>
                {t.placeholders.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[10px] font-mono text-brand-600 dark:text-brand-400">
                    {`{{${p}}}`}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">Standardized Clause Library</span>
            <Button size="sm" variant="primary" onClick={() => setShowAddClause(!showAddClause)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add New Clause
            </Button>
          </div>

          {showAddClause && (
            <Card className="p-4">
              <form onSubmit={handleAddClause} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Clause Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Category (e.g. Liability)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white"
                  />
                  <select
                    value={riskRating}
                    onChange={(e) => setRiskRating(e.target.value as any)}
                    className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>

                <textarea
                  required
                  placeholder="Clause Body Text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-24 p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white font-mono text-xs"
                />

                <Button type="submit" size="sm" variant="primary">Save Clause to Library</Button>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clauses.map((c) => (
              <Card key={c._id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> {c.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-600">
                    {c.category}
                  </span>
                </div>

                <p className="text-xs text-gray-700 dark:text-slate-300 font-mono leading-relaxed bg-gray-50 dark:bg-slate-900/60 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                  {c.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
