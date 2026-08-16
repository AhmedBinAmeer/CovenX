import React, { useState } from 'react';
import { useGetContractsQuery } from '../store/api/contractsApi.js';
import { useNavigate } from 'react-router-dom';
import { ContractStatusBadge } from '../components/contracts/ContractStatusBadge.js';
import { RiskBadge } from '../components/contracts/RiskBadge.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Search, Plus, Filter, FileText, ArrowRight } from 'lucide-react';

export const ContractList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type,   setType]   = useState('');
  const navigate = useNavigate();

  const { data: contracts = [], isLoading } = useGetContractsQuery({
    search: search || undefined,
    status: status || undefined,
    type:   type   || undefined,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Contract <span className="text-navy-500 dark:text-navy-300">Repository</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            350,000 active contracts with granular metadata search.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/editor')}>
          <Plus className="w-4 h-4 mr-1.5" /> Author New Contract
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-navy-300 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by contract number, title, or parties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-navy-200 dark:border-navy-700 rounded-lg text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-navy-300 dark:text-slate-500" />
          {[
            { value: status, onChange: setStatus, label: 'All Statuses', options: ['DRAFT','PENDING_REVIEW','APPROVED','EXECUTED'] },
            { value: type,   onChange: setType,   label: 'All Types',    options: ['MSA','SLA','NDA','PROCUREMENT'] },
          ].map((sel, i) => (
            <select
              key={i}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="text-xs border border-navy-200 dark:border-navy-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400/30 transition-all"
            >
              <option value="">{sel.label}</option>
              {sel.options.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
        </div>
      </Card>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-navy-100 dark:border-navy-800/60 rounded-xl overflow-hidden shadow-brand-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-50 dark:bg-navy-950/50 text-navy-500 dark:text-slate-400 font-semibold border-b border-navy-100 dark:border-navy-800">
              <tr>
                {['Contract Number & Title','Type','Department','Status','Risk Rating','Value','Actions'].map((h, i) => (
                  <th key={i} className={`p-4 ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50 dark:divide-navy-900/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading contract repository…
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No contracts found. Click <strong>"Author New Contract"</strong> to create one.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-navy-50/50 dark:hover:bg-navy-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-ember-500/10 text-ember-500 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{c.title}</p>
                          <p className="font-mono text-[10px] text-gray-400">{c.contractNumber} (v{c.version})</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-navy-600 dark:text-navy-300">{c.type}</td>
                    <td className="p-4 text-gray-600 dark:text-slate-400">{c.department}</td>
                    <td className="p-4"><ContractStatusBadge status={c.status} /></td>
                    <td className="p-4"><RiskBadge category={c.riskCategory} score={c.riskScore} /></td>
                    <td className="p-4 font-bold text-forest-600 dark:text-forest-400">${c.value.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/contracts/${c._id}`)}>
                        Inspect <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
