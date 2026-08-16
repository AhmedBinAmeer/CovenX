import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetContractByIdQuery,
  useSubmitForApprovalMutation,
  useApproveStepMutation,
  useSignContractMutation,
  useAddObligationMutation,
  useUpdateContentAndVersionMutation,
} from '../store/api/contractsApi.js';
import { useGetAuditLogsQuery } from '../store/api/auditApi.js';
import { useTheme } from '../context/ThemeContext.js';
import { ContractStatusBadge } from '../components/contracts/ContractStatusBadge.js';
import { RiskBadge } from '../components/contracts/RiskBadge.js';
import { ApprovalTimeline } from '../components/contracts/ApprovalTimeline.js';
import { SignatureModal } from '../components/contracts/SignatureModal.js';
import { VersionDiffViewer } from '../components/contracts/VersionDiffViewer.js';
import { ObligationsTable } from '../components/contracts/ObligationsTable.js';
import { AuditTrailViewer } from '../components/contracts/AuditTrailViewer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { ArrowLeft, Send, CheckCircle2, FileSignature, CheckSquare, GitCompare, Activity, Edit, Lock } from 'lucide-react';

export const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const { data: contract, isLoading } = useGetContractByIdQuery(id || '');
  const { data: auditLogs = [] } = useGetAuditLogsQuery(id || '');

  const [submitForApproval] = useSubmitForApprovalMutation();
  const [approveStep] = useApproveStepMutation();
  const [signContract] = useSignContractMutation();
  const [addObligation] = useAddObligationMutation();
  const [updateContent] = useUpdateContentAndVersionMutation();

  const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'APPROVALS' | 'SIGNATURES' | 'REVISIONS' | 'OBLIGATIONS' | 'AUDIT'>('DOCUMENT');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    setTheme('light');
    if (contract) {
      setEditContent(contract.content);
    }
  }, [contract, setTheme]);

  if (isLoading || !contract) {
    return <div className="p-8 text-center text-gray-500">Loading contract 360° record...</div>;
  }

  const handleSaveVersion = async () => {
    if (id) {
      await updateContent({
        id,
        title: contract.title,
        content: editContent,
        changeSummary: changeSummary || 'Content edit via detail view',
      });
      setIsEditing(false);
    }
  };

  const handleSubmit = async () => {
    if (id) await submitForApproval(id);
  };

  const handleApprove = async (step: number) => {
    if (id) await approveStep({ id, step, comments: 'Step authorized by Lead Architect.' });
  };

  const handleSign = async (signerName: string, signerEmail: string) => {
    if (id) await signContract({ id, signerName, signerEmail });
  };

  const handleAddObligation = async (obData: any) => {
    if (id) await addObligation({ id, ...obData });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contracts')} className="flex items-center gap-1 text-xs font-semibold text-navy-400 hover:text-navy-600 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Repository
        </button>

        <div className="flex items-center gap-2">
          {contract.status === 'DRAFT' && (
            <Button size="sm" variant="primary" onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-1.5" /> Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{contract.title}</h1>
              <ContractStatusBadge status={contract.status} />
              <RiskBadge category={contract.riskCategory} score={contract.riskScore} />
            </div>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400 mt-1">
              Number: <span className="font-bold text-navy-600 dark:text-navy-300">{contract.contractNumber}</span> | Version: v{contract.version} | Type: {contract.type}
            </p>
          </div>

          <div className="text-right text-xs text-gray-500 dark:text-slate-400 space-y-1">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">${contract.value.toLocaleString()} USD</p>
            <p>Department: <strong className="text-gray-700 dark:text-slate-200">{contract.department}</strong></p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto pb-1">
          {[
            { id: 'DOCUMENT', label: 'Contract Document', icon: Edit },
            { id: 'APPROVALS', label: 'Approval Workflow', icon: CheckCircle2 },
            { id: 'SIGNATURES', label: 'Digital Signatures', icon: FileSignature },
            { id: 'REVISIONS', label: 'Version Revisions', icon: GitCompare },
            { id: 'OBLIGATIONS', label: 'Obligations & SLAs', icon: CheckSquare },
            { id: 'AUDIT', label: 'Audit Trail', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-b-2 ${
                  isActive
                    ? 'border-ember-500 text-ember-600 dark:text-ember-400 bg-ember-500/5 font-bold'
                    : 'border-transparent text-gray-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === 'DOCUMENT' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 dark:text-slate-300">Document Body Content (v{contract.version})</span>
                {!isEditing ? (
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit & Create Revision
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Change summary..."
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      className="px-2 py-1 border border-gray-300 dark:border-slate-700 rounded text-xs"
                    />
                    <Button size="sm" variant="primary" onClick={handleSaveVersion}>Save Version bump</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="bg-gray-50 dark:bg-slate-900/60 p-6 rounded-xl border border-gray-200 dark:border-slate-800 font-mono text-xs text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {contract.content}
                </div>
              ) : (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none"
                />
              )}
            </div>
          )}

          {activeTab === 'APPROVALS' && (
            <ApprovalTimeline workflow={contract.approvalWorkflow} onApproveStep={handleApprove} />
          )}

          {activeTab === 'SIGNATURES' && (
            <SignatureModal signatures={contract.signatureHistory} onSignContract={handleSign} />
          )}

          {activeTab === 'REVISIONS' && (
            <VersionDiffViewer history={contract.versionHistory} />
          )}

          {activeTab === 'OBLIGATIONS' && (
            <ObligationsTable obligations={contract.obligations} onAddObligation={handleAddObligation} />
          )}

          {activeTab === 'AUDIT' && (
            <AuditTrailViewer logs={auditLogs} />
          )}
        </div>
      </Card>
    </div>
  );
};
