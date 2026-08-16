import React, { useState } from 'react';
import { ISignatureRecord } from '../../types/contract.types.js';
import { FileSignature, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface SignatureModalProps {
  signatures: ISignatureRecord[];
  onSignContract: (signerName: string, signerEmail: string) => void;
  isLoading?: boolean;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ signatures, onSignContract, isLoading }) => {
  const [signerName, setSignerName] = useState('Chief Legal Officer');
  const [signerEmail, setSignerEmail] = useState('clo@covenx.io');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <FileSignature className="w-4 h-4 text-ember-500" /> Digital Signatures & Non-Repudiation Audit
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signatures.map((sig, idx) => {
          const isSigned = sig.status === 'SIGNED';

          return (
            <div key={idx} className="bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">{sig.signerRole}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isSigned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {sig.status}
                </span>
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{sig.signerName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{sig.signerEmail}</p>
              </div>

              {isSigned ? (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 space-y-1">
                  <p className="flex items-center gap-1 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Verifiable Hash Generated</p>
                  <p className="font-mono text-[10px] truncate">{sig.signatureHash}</p>
                  <p className="text-[10px] text-gray-400">Signed at: {new Date(sig.signedAt || '').toLocaleString()}</p>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isLoading}
                    onClick={() => onSignContract(sig.signerName, sig.signerEmail)}
                    className="w-full"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1" /> Execute Digital Signature
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
