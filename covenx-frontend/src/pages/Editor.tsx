import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { useGetTemplatesQuery, useGetClausesQuery } from '../store/api/templatesApi.js';
import { useCreateContractMutation } from '../store/api/contractsApi.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { ClauseLibraryDrawer } from '../components/editor/ClauseLibraryDrawer.js';
import { RiskAnalysisPanel } from '../components/editor/RiskAnalysisPanel.js';
import { Save, Sparkles, BookOpen, Send } from 'lucide-react';
import { RiskCategory } from '../types/contract.types.js';

export const Editor: React.FC = () => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { data: templates = [] } = useGetTemplatesQuery();
  const { data: clauses = [] } = useGetClausesQuery();
  const [createContract, { isLoading }] = useCreateContractMutation();

  const [title, setTitle] = useState('Master Services Agreement - Enterprise SLA 2026');
  const [contractType, setContractType] = useState('MSA');
  const [department, setDepartment] = useState('Legal & Procurement');
  const [value, setValue] = useState(650000);
  const [content, setContent] = useState(
    'MASTER SERVICES AGREEMENT\n\nThis Master Services Agreement ("Agreement") is made on August 15, 2026, by and between CovenX Enterprise Solutions ("Provider") and Client Global Corp ("Client").\n\n1. OBLIGATIONS & SCOPE OF WORK\nProvider shall deliver 99.99% uptime SLA monitoring, cloud contract lifecycle orchestration, and automated obligation tracking.\n\n2. INDEMNIFICATION & LIABILITY\nEach party agrees to indemnify and hold harmless the other party against third-party claims up to $650,000.\n\n3. TERMINATION & RENEWAL\nThis contract renews automatically unless written notice of termination is delivered 60 days prior to expiry.'
  );

  const [showClauses, setShowClauses] = useState(false);

  useEffect(() => {
    // Steering rule: Light minimalist for contract authoring studio
    setTheme('light');
  }, [setTheme]);

  // AI Risk Evaluation
  const calculateRisk = () => {
    let score = 20;
    const risks: any[] = [];

    if (value > 500000) {
      score += 25;
      risks.push({
        clauseTitle: 'High Financial Exposure',
        severity: RiskCategory.HIGH,
        description: `Contract value of $${value.toLocaleString()} exceeds high-risk threshold.`,
        recommendation: 'Requires CFO and Board approval.',
      });
    }

    if (content.toLowerCase().includes('unlimited liability')) {
      score += 35;
      risks.push({
        clauseTitle: 'Unlimited Liability Clause',
        severity: RiskCategory.CRITICAL,
        description: 'Contains unlimited liability terms increasing risk exposure.',
        recommendation: 'Cap total liability to 1x contract value.',
      });
    }

    let category = RiskCategory.LOW;
    if (score >= 75) category = RiskCategory.CRITICAL;
    else if (score >= 50) category = RiskCategory.HIGH;
    else if (score >= 35) category = RiskCategory.MEDIUM;

    return { score: Math.min(score, 100), category, risks };
  };

  const riskEval = calculateRisk();

  const handleSaveDraft = async () => {
    try {
      const res = await createContract({
        title,
        content,
        type: contractType as any,
        department,
        value: Number(value),
      }).unwrap();
      navigate(`/contracts/${res._id}`);
    } catch (err) {
      console.error('Failed to create contract draft:', err);
    }
  };

  const handleSelectTemplate = (tContent: string) => {
    setContent(tContent.replace('{{CONTRACT_VALUE}}', value.toString()));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Contract Authoring Studio</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none w-full mt-0.5"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowClauses(!showClauses)}>
            <BookOpen className="w-4 h-4 mr-1.5" /> Clause Drawer
          </Button>
          <Button variant="primary" size="sm" disabled={isLoading} onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-1.5" /> Save Draft & Create Record
          </Button>
        </div>
      </div>

      {/* Metadata Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 text-xs shadow-sm">
        <div>
          <label className="block text-gray-500 font-semibold mb-1">Contract Type</label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
          >
            <option value="MSA">MSA (Master Services)</option>
            <option value="SLA">SLA (Service Level)</option>
            <option value="NDA">NDA (Non-Disclosure)</option>
            <option value="PROCUREMENT">Procurement</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-500 font-semibold mb-1">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-500 font-semibold mb-1">Contract Value ($ USD)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none font-bold text-brand-600"
          />
        </div>

        <div>
          <label className="block text-gray-500 font-semibold mb-1">Load Dynamic Template</label>
          <select
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
          >
            <option value="">Select Template...</option>
            {templates.map((t) => (
              <option key={t._id} value={t.content}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Document Text Editor */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 min-h-[550px] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-100 pb-2">
            <span>Authoring Mode: Light Minimalist</span>
            <span>Auto-saving draft...</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[450px] font-mono text-xs leading-relaxed text-gray-800 bg-transparent resize-none focus:outline-none"
          />
        </div>

        {/* Right 1 Col: Clause Library & AI Risk Panel */}
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
