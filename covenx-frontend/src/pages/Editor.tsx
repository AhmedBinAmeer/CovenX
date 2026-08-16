import React, { useState } from 'react';
import { useGetTemplatesQuery, useGetClausesQuery } from '../store/api/templatesApi.js';
import { useCreateContractMutation } from '../store/api/contractsApi.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { ClauseLibraryDrawer } from '../components/editor/ClauseLibraryDrawer.js';
import { RiskAnalysisPanel } from '../components/editor/RiskAnalysisPanel.js';
import { Save, BookOpen } from 'lucide-react';
import { RiskCategory } from '../types/contract.types.js';

export const Editor: React.FC = () => {
  const navigate      = useNavigate();
  const { data: templates = [] } = useGetTemplatesQuery();
  const { data: clauses   = [] } = useGetClausesQuery();
  const [createContract, { isLoading }] = useCreateContractMutation();

  const [title,        setTitle]        = useState('Master Services Agreement - Enterprise SLA 2026');
  const [contractType, setContractType] = useState('MSA');
  const [department,   setDepartment]   = useState('Legal & Procurement');
  const [value,        setValue]        = useState(650000);
  const [content,      setContent]      = useState(
    'MASTER SERVICES AGREEMENT\n\nThis Master Services Agreement ("Agreement") is made on August 15, 2026, by and between CovenX Enterprise Solutions ("Provider") and Client Global Corp ("Client").\n\n1. OBLIGATIONS & SCOPE OF WORK\nProvider shall deliver 99.99% uptime SLA monitoring, cloud contract lifecycle orchestration, and automated obligation tracking.\n\n2. INDEMNIFICATION & LIABILITY\nEach party agrees to indemnify and hold harmless the other party against third-party claims up to $650,000.\n\n3. TERMINATION & RENEWAL\nThis contract renews automatically unless written notice of termination is delivered 60 days prior to expiry.'
  );
  const [showClauses, setShowClauses] = useState(false);

  const calculateRisk = () => {
    let score = 20;
    const risks: any[] = [];
    if (value > 500_000) {
      score += 25;
      risks.push({ clauseTitle: 'High Financial Exposure', severity: RiskCategory.HIGH,     description: `Contract value of $${value.toLocaleString()} exceeds high-risk threshold.`, recommendation: 'Requires CFO and Board approval.'   });
    }
    if (content.toLowerCase().includes('unlimited liability')) {
      score += 35;
      risks.push({ clauseTitle: 'Unlimited Liability Clause', severity: RiskCategory.CRITICAL, description: 'Contains unlimited liability terms.',                                         recommendation: 'Cap total liability to 1x contract value.' });
    }
    let category = RiskCategory.LOW;
    if      (score >= 75) category = RiskCategory.CRITICAL;
    else if (score >= 50) category = RiskCategory.HIGH;
    else if (score >= 35) category = RiskCategory.MEDIUM;
    return { score: Math.min(score, 100), category, risks };
  };

  const riskEval = calculateRisk();

  const handleSaveDraft = async () => {
    try {
      const res = await createContract({ title, content, type: contractType as any, department, value: Number(value) }).unwrap();
      navigate(`/contracts/${res._id}`);
    } catch (err) {
      console.error('Failed to create contract draft:', err);
    }
  };

  const selectCls = 'w-full p-2 border border-navy-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-400/30 text-xs transition-all bg-white';
  const inputCls  = `${selectCls}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-100 pb-4">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-600">
            Contract Authoring Studio
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-black text-gray-900 bg-transparent border-none focus:outline-none w-full mt-0.5 tracking-tight placeholder:text-gray-300"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setShowClauses(!showClauses)}>
            <BookOpen className="w-4 h-4 mr-1.5" /> Clause Drawer
          </Button>
          <Button variant="primary" size="sm" disabled={isLoading} onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-navy-100 shadow-brand-sm text-xs">
        <div>
          <label className="block text-navy-500 font-semibold mb-1.5">Contract Type</label>
          <select value={contractType} onChange={(e) => setContractType(e.target.value)} className={selectCls}>
            {['MSA','SLA','NDA','PROCUREMENT'].map((t) => (
              <option key={t} value={t}>{t === 'MSA' ? 'MSA (Master Services)' : t === 'SLA' ? 'SLA (Service Level)' : t === 'NDA' ? 'NDA (Non-Disclosure)' : 'Procurement'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-navy-500 font-semibold mb-1.5">Department</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="block text-navy-500 font-semibold mb-1.5">Contract Value ($&nbsp;USD)</label>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))}
            className={`${inputCls} font-bold text-forest-600`}
          />
        </div>

        <div>
          <label className="block text-navy-500 font-semibold mb-1.5">Load Template</label>
          <select onChange={(e) => setContent(e.target.value.replace('{{CONTRACT_VALUE}}', value.toString()))} className={selectCls}>
            <option value="">Select template…</option>
            {templates.map((t) => <option key={t._id} value={t.content}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Editor + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document editor */}
        <div className="lg:col-span-2 bg-white border border-navy-100 rounded-xl shadow-brand-sm p-6 min-h-[550px] space-y-3">
          {/* Toolbar bar */}
          <div className="flex items-center justify-between text-xs border-b border-navy-50 pb-2">
            <span className="text-forest-600 font-semibold">Authoring Mode — Light Minimalist</span>
            <span className="text-gray-400 italic">Auto-saving draft…</span>
          </div>

          {/* The textarea editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[450px] font-mono text-xs leading-relaxed text-gray-800 bg-transparent resize-none focus:outline-none"
          />
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          <RiskAnalysisPanel score={riskEval.score} category={riskEval.category} risks={riskEval.risks} />
          {showClauses && (
            <ClauseLibraryDrawer clauses={clauses} onInsertClause={(cText) => setContent((prev) => prev + cText)} />
          )}
        </div>
      </div>
    </div>
  );
};
