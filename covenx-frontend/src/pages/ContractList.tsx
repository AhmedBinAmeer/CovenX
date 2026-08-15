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
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const { data: contracts = [], isLoading } = useGetContractsQuery({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Contract Repository</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">350,000 active contract database with granular metadata search.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/editor')}>
          <Plus className="w-4 h-4 mr-1.5" /> Author New Contract
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by contract number, title, or parties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-xs bg-transparent text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="EXECUTED">Executed</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="text-xs border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="MSA">MSA</option>
            <option value="SLA">SLA</option>
            <option value="NDA">NDA</option>
            <option value="PROCUREMENT">Procurement</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-600 dark:text-slate-400 font-semibold border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Contract Number & Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk Rating</th>
                <th className="p-4">Value</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading contracts repository...</td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No contracts found. Click "Author New Contract" to create one.</td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{c.title}</p>
                          <p className="font-mono text-[10px] text-gray-400">{c.contractNumber} (v{c.version})</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700 dark:text-slate-300">{c.type}</td>
                    <td className="p-4 text-gray-600 dark:text-slate-400">{c.department}</td>
                    <td className="p-4"><ContractStatusBadge status={c.status} /></td>
                    <td className="p-4"><RiskBadge category={c.riskCategory} score={c.riskScore} /></td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">${c.value.toLocaleString()}</td>
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
