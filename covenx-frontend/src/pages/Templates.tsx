import React, { useState } from 'react';
import { useGetTemplatesQuery, useGetClausesQuery, useCreateClauseMutation } from '../store/api/templatesApi.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { BookOpen, FileText, Plus, ShieldCheck, Tag } from 'lucide-react';

export const Templates: React.FC = () => {
  const { data: templates = [] } = useGetTemplatesQuery();
  const { data: clauses   = [] } = useGetClausesQuery();
  const [createClause] = useCreateClauseMutation();

  const [activeTab,     setActiveTab]     = useState<'TEMPLATES' | 'CLAUSES'>('TEMPLATES');
  const [showAddClause, setShowAddClause] = useState(false);
  const [title,         setTitle]         = useState('');
  const [category,      setCategory]      = useState('Indemnification');
  const [body,          setBody]          = useState('');
  const [riskRating,    setRiskRating]    = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  const handleAddClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && body) {
      await createClause({ title, category, body, riskRating, isMandatory: false });
      setTitle('');
      setBody('');
      setShowAddClause(false);
    }
  };

  const riskColors: Record<string, string> = {
    LOW:    'bg-forest-500/10 text-forest-600 dark:text-forest-400',
    MEDIUM: 'bg-ember-500/10  text-ember-600  dark:text-ember-400',
    HIGH:   'bg-red-500/10    text-red-600    dark:text-red-400',
  };

  const inputCls = 'w-full p-2 border border-navy-200 dark:border-navy-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400/30 text-xs transition-all';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Templates <span className="text-forest-500">&</span> Clause Library
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Centralised repository of verified contract templates and legally approved clauses.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'TEMPLATES' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('TEMPLATES')}
          >
            <FileText className="w-4 h-4 mr-1.5" /> Contract Templates ({templates.length})
          </Button>
          <Button
            variant={activeTab === 'CLAUSES' ? 'green' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('CLAUSES')}
          >
            <BookOpen className="w-4 h-4 mr-1.5" /> Clause Library ({clauses.length})
          </Button>
        </div>
      </div>

      {/* ── TEMPLATES TAB ─────────────────────────────────────── */}
      {activeTab === 'TEMPLATES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((t) => (
            <Card key={t._id} className="p-6 space-y-4 hover:shadow-brand-md transition-shadow">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-navy-100 dark:border-navy-800 pb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-navy-500 dark:text-navy-300" />
                  {t.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy-500/10 text-navy-600 dark:text-navy-300">
                  {t.category}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-400">{t.description}</p>

              {/* Content preview */}
              <div className="bg-navy-50 dark:bg-navy-950/40 p-3 rounded-lg border border-navy-100 dark:border-navy-800 font-mono text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {t.content}
              </div>

              {/* Placeholder chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Placeholders:
                </span>
                {t.placeholders.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-ember-500/10 text-[10px] font-mono text-ember-600 dark:text-ember-400">
                    {`{{${p}}}`}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

      /* ── CLAUSES TAB ──────────────────────────────────────── */
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-navy-500 dark:text-slate-400">Standardised Clause Library</span>
            <Button size="sm" variant="green" onClick={() => setShowAddClause(!showAddClause)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add New Clause
            </Button>
          </div>

          {/* Add clause form */}
          {showAddClause && (
            <Card className="p-4">
              <form onSubmit={handleAddClause} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" required placeholder="Clause Title"                value={title}      onChange={(e) => setTitle(e.target.value)}      className={inputCls} />
                  <input type="text" required placeholder="Category (e.g. Liability)"   value={category}   onChange={(e) => setCategory(e.target.value)}    className={inputCls} />
                  <select value={riskRating} onChange={(e) => setRiskRating(e.target.value as any)} className={inputCls}>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>
                <textarea required placeholder="Clause Body Text…" value={body} onChange={(e) => setBody(e.target.value)}
                  className={`${inputCls} h-24 font-mono resize-none`}
                />
                <Button type="submit" size="sm" variant="green">Save Clause to Library</Button>
              </form>
            </Card>
          )}

          {/* Clause cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clauses.map((c) => (
              <Card key={c._id} className="p-5 space-y-3 hover:shadow-forest-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-forest-500" /> {c.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskColors[c.riskRating] || riskColors.LOW}`}>
                      {c.riskRating}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-500/10 text-navy-600 dark:text-navy-300">
                      {c.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 dark:text-slate-300 font-mono leading-relaxed bg-forest-50 dark:bg-forest-900/20 p-3 rounded-lg border border-forest-100 dark:border-forest-800/40">
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
