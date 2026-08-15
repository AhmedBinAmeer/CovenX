import React from 'react';
import { IApprovalStep } from '../../types/contract.types.js';
import { CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface TimelineProps {
  workflow: IApprovalStep[];
  onApproveStep?: (step: number) => void;
  isLoading?: boolean;
}

export const ApprovalTimeline: React.FC<TimelineProps> = ({ workflow, onApproveStep, isLoading }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-500" /> Multi-Level Approval Workflow
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
        {workflow.map((step) => {
          const isApproved = step.status === 'APPROVED';
          const isRejected = step.status === 'REJECTED';
          const isPending = step.status === 'PENDING';

          return (
            <div key={step.step} className="relative flex items-start justify-between bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
              <div className="absolute -left-6 top-4 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                {isApproved && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isRejected && <XCircle className="w-5 h-5 text-rose-500" />}
                {isPending && <Clock className="w-5 h-5 text-amber-500" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">STEP {step.step}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{step.role.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {isApproved
                    ? `Approved by ${step.approverName || 'Reviewer'} on ${new Date(step.decidedAt || '').toLocaleDateString()}`
                    : 'Awaiting review and authorization signature.'}
                </p>
                {step.comments && (
                  <p className="text-xs italic text-gray-600 dark:text-slate-300 mt-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded border border-gray-100 dark:border-slate-800">
                    "{step.comments}"
                  </p>
                )}
              </div>

              {isPending && onApproveStep && (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isLoading}
                  onClick={() => onApproveStep(step.step)}
                >
                  Approve Step
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
