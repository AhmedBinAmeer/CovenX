import { ChangeEvent, useEffect, useState } from 'react';
import { TiltCard } from '../components/Motion';
import {
  Archive,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Download,
  FileClock,
  FileSignature,
  FileUp,
  GitCompareArrows,
  History,
  PenTool,
  RefreshCw,
  Send,
  ShieldCheck,
  Signature,
  Trash2,
  UploadCloud,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { endpoints, listItems } from '../services/api';
import {
  Contract,
  ContractVersion,
  DocumentRecord,
  documentUploadSchema,
  parseForm,
  User,
} from '../services/types';

export function ContractDetail({ id, navigate }: { id: string; navigate: (path: string) => void }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  // E-Signature modal state
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedSignerIds, setSelectedSignerIds] = useState<string[]>([]);
  const [signProvider, setSignProvider] = useState('mock');
  const [signExpiryDays, setSignExpiryDays] = useState(7);

  const load = async () => {
    try {
      const [c, v, a, s, h, d, u, me] = await Promise.all([
        endpoints.contract(id),
        endpoints.contractVersions(id).catch(() => []),
        endpoints.contractApprovals(id).catch(() => []),
        endpoints.signatures(id).catch(() => []),
        endpoints.contractHistory(id).catch(() => []),
        endpoints.documentsForContract(id).catch(() => []),
        endpoints.users().catch(() => []),
        endpoints.me().catch(() => null),
      ]);
      setContract(c);
      setVersions(listItems(v as any));
      setApprovals(listItems(a as any));
      setSignatures(listItems(s as any));
      setHistory(listItems(h as any));
      setDocs(listItems(d as any));
      const userList = listItems(u as any) as any[];
      setAllUsers(userList);
      setCurrentUser(me);

      // Default select Victor Vendor or first user for signature request
      if (selectedSignerIds.length === 0 && userList.length > 0) {
        const victor = userList.find((usr: any) => usr.email?.includes('vendor'));
        if (victor) setSelectedSignerIds([victor._id]);
        else if (userList[0]?._id) setSelectedSignerIds([userList[0]._id]);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!contract) {
    return (
      <>
        <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="empty">{error || 'Loading contract…'}</div>
      </>
    );
  }

  const act = async (operation: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await operation();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const checksum = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const payload = parseForm(documentUploadSchema, {
        contractId: id,
        versionId: contract.currentVersionId,
        documentType: 'contract-document',
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        checksum,
        classification: 'confidential',
      });
      const init = await endpoints.initiateUpload(payload);
      const uploadResponse = await fetch(init.uploadUrl, {
        method: 'PUT',
        headers: init.uploadHeaders ?? {},
        body: file,
      });
      if (!uploadResponse.ok && !init.uploadUrl.startsWith('mock://')) {
        throw new Error('The secure file upload was rejected.');
      }
      await endpoints.finalizeUpload(init.documentId, checksum);
      await load();
    } catch (e: any) {
      setError(e.issues?.[0]?.message ?? e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRequestSignature = async () => {
    if (selectedSignerIds.length === 0) {
      setError('Please select at least one signer.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const signers = selectedSignerIds.map((userId, idx) => ({
        userId,
        signingOrder: idx + 1,
      }));
      const expiresAt = new Date(Date.now() + signExpiryDays * 86400000).toISOString();
      await endpoints.requestSignature(id, {
        provider: signProvider,
        contractVersionId: contract.currentVersionId,
        signers,
        expiresAt,
      });
      setShowSignModal(false);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCompleteSignature = async (requestId: string) => {
    if (!window.confirm('Are you ready to digitally sign and execute this agreement?')) return;
    setBusy(true);
    setError('');
    try {
      await endpoints.completeSignature(requestId, {
        evidenceRefs: [
          {
            type: 'e-signature',
            signerId: currentUser?.user?._id,
            signerEmail: currentUser?.user?.email,
            signerName: currentUser?.user?.profile?.displayName,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeclineSignature = async (requestId: string) => {
    const reason = window.prompt('Please enter the reason for declining this signature request:');
    if (!reason) return;
    setBusy(true);
    setError('');
    try {
      await endpoints.declineSignature(requestId, { reason });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const formattedType = contract.contractType?.replace(/_/g, ' ') ?? 'Standard agreement';
  const formattedValue = contract.financial?.value
    ? `${contract.financial.currency ?? 'USD'} ${Number(contract.financial.value).toLocaleString()}`
    : '—';

  const getUserDisplayName = (userId: string) => {
    const usr = allUsers.find((u) => u._id === userId);
    return usr ? `${usr.profile?.displayName || usr.email} (${usr.email})` : userId;
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>
            <ArrowLeft size={15} /> Contracts
          </button>
          <div className="eyebrow" style={{ marginTop: 18 }}>Contract record</div>
          <h1>
            {contract.contractNumber ?? 'Contract'}{' '}
            <span
              className={`badge badge-${
                contract.status === 'active'
                  ? 'green'
                  : contract.status === 'signature'
                  ? 'orange'
                  : contract.status === 'approval'
                  ? 'blue'
                  : 'grey'
              }`}
              style={{ verticalAlign: 'middle', letterSpacing: 0 }}
            >
              {contract.status}
            </span>
          </h1>
          <p className="subtitle">
            {contract.title ?? 'Agreement lifecycle workspace'} · version {contract.version}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => navigate(`/intelligence?contractId=${encodeURIComponent(id)}`)}
          >
            <BrainCircuit size={15} /> Intelligence
          </button>
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => navigate(`/negotiation/${encodeURIComponent(id)}`)}
          >
            <GitCompareArrows size={15} /> Negotiate
          </button>
          {contract.status === 'draft' && (
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={() => act(() => endpoints.submitReview(id, contract.version))}
            >
              <Send size={15} /> Submit review
            </button>
          )}
          {contract.status === 'signature' && (
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={() => setShowSignModal(true)}
            >
              <FileSignature size={15} /> Request Signature
            </button>
          )}
          {['active', 'monitoring', 'renewal'].includes(contract.status) && (
            <button
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => act(() => endpoints.archiveContract(id, contract.version))}
            >
              <Archive size={15} /> Archive
            </button>
          )}
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={() => act(() => endpoints.renewContract(id))}
          >
            <RefreshCw size={15} /> Renew
          </button>
        </div>
      </div>

      {error && <div className="notice" style={{ marginBottom: 18 }}>{error}</div>}

      {/* Signature Request Modal */}
      {showSignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 540,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PenTool size={18} color="#e68a36" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Initiate E-Signature Workflow</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowSignModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              Select counterparties and internal authorities who must sign contract{' '}
              <strong>{contract.contractNumber}</strong> to complete execution.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Signature Provider
              </label>
              <select
                className="input"
                style={{ width: '100%', padding: '8px 12px' }}
                value={signProvider}
                onChange={(e) => setSignProvider(e.target.value)}
              >
                <option value="mock">CovenX Native E-Sign (Mock Provider)</option>
                <option value="docusign">DocuSign Integration</option>
                <option value="adobesign">Adobe Acrobat Sign</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Signing Validity Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                className="input"
                style={{ width: '100%', padding: '8px 12px' }}
                value={signExpiryDays}
                onChange={(e) => setSignExpiryDays(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Select Required Signers ({selectedSignerIds.length} selected)
              </label>
              <div
                style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {allUsers.map((usr) => {
                  const isChecked = selectedSignerIds.includes(usr._id);
                  return (
                    <label
                      key={usr._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 10px',
                        borderRadius: 6,
                        backgroundColor: isChecked ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSignerIds([...selectedSignerIds, usr._id]);
                          } else {
                            setSelectedSignerIds(selectedSignerIds.filter((id) => id !== usr._id));
                          }
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>{usr.profile?.displayName || usr.email}</strong>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {usr.email} {(usr.profile as any)?.title ? `· ${(usr.profile as any).title}` : ''}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSignModal(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRequestSignature}
                disabled={busy || selectedSignerIds.length === 0}
              >
                <Send size={14} /> Send Signature Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header">
            <div>
              <h2>Lifecycle overview</h2>
              <div className="panel-caption">Authoritative contract state and commercial context</div>
            </div>
            <ShieldCheck size={19} color="#1d9365" />
          </div>

          <div className="contract-meta-grid">
            <div className="contract-meta-item">
              <span className="contract-meta-label">Contract type</span>
              <strong className="contract-meta-value" style={{ textTransform: 'capitalize' }}>
                {formattedType}
              </strong>
            </div>

            <div className="contract-meta-item">
              <span className="contract-meta-label">Total value</span>
              <strong className="contract-meta-value highlight">{formattedValue}</strong>
            </div>

            <div className="contract-meta-item">
              <span className="contract-meta-label">Effective date</span>
              <strong className="contract-meta-value">
                {contract.effectiveDate ? new Date(contract.effectiveDate).toLocaleDateString() : '—'}
              </strong>
            </div>

            <div className="contract-meta-item">
              <span className="contract-meta-label">Expiry date</span>
              <strong className="contract-meta-value">
                {contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString() : '—'}
              </strong>
            </div>

            {contract.parties && contract.parties.length > 0 && (
              <div className="contract-meta-item full">
                <span className="contract-meta-label">Counterparties</span>
                <div className="counterparty-pills">
                  {contract.parties.map((p: any, idx: number) => (
                    <span key={idx} className="counterparty-pill">
                      <strong>{p.name ?? 'Counterparty'}</strong>
                      {p.role && <small>({p.role})</small>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TiltCard>

        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header">
            <div>
              <h2>Secure documents</h2>
              <div className="panel-caption">Allowed files: PDF, Word, and text up to 50 MB</div>
            </div>
            <UploadCloud size={19} color="#e68a36" />
          </div>

          <label className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <FileUp size={15} /> {uploading ? 'Uploading securely…' : 'Upload document'}
            <input
              type="file"
              accept="application/pdf,.doc,.docx,.txt"
              hidden
              disabled={uploading}
              onChange={upload}
            />
          </label>

          <div style={{ marginTop: 14 }}>
            {docs.length ? (
              docs.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: '10px 0',
                    borderTop: '1px solid #eef2f4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12 }}>{doc.fileName}</strong>
                    <div className="panel-caption">
                      {doc.scanStatus} · {Math.ceil(doc.sizeBytes / 1024)} KB
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="icon-button"
                      aria-label={`Download ${doc.fileName}`}
                      disabled={doc.scanStatus !== 'clean'}
                      onClick={async () => {
                        try {
                          const result = await endpoints.downloadDocument(doc._id);
                          window.open(result.url, '_blank', 'noopener,noreferrer');
                        } catch (e: any) {
                          setError(e.message);
                        }
                      }}
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${doc.fileName}`}
                      onClick={() =>
                        act(async () => {
                          await endpoints.deleteDocument(doc._id, doc.version);
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="panel-caption" style={{ textAlign: 'center', padding: '16px 0' }}>
                No documents uploaded yet.
              </div>
            )}
          </div>
        </TiltCard>
      </div>

      <div className="grid-2">
        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header">
            <div>
              <h2>
                <CheckCircle2 size={17} style={{ verticalAlign: 'middle', marginRight: 7, color: '#1d9365' }} /> Approvals
              </h2>
              <div className="panel-caption">Assigned decisions and governance review</div>
            </div>
          </div>
          {approvals.length === 0 ? (
            <div className="empty" style={{ padding: 24, textAlign: 'center' }}>
              No approval tasks recorded.
            </div>
          ) : (
            approvals.map((a: any) => (
              <div key={a._id} style={{ padding: 12, borderTop: '1px solid #eef2f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{a.stageKey ?? 'Approval stage'}</strong>
                  <div className="panel-caption">
                    Assigned: {getUserDisplayName(a.assignedUserId)}
                  </div>
                </div>
                <span
                  className={`badge badge-${
                    a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'orange'
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))
          )}
        </TiltCard>

        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>
                <Signature size={17} style={{ verticalAlign: 'middle', marginRight: 7, color: '#e68a36' }} /> E-Signatures
              </h2>
              <div className="panel-caption">Execution and digital signer status</div>
            </div>
            {contract.status === 'signature' && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => setShowSignModal(true)}
              >
                <PenTool size={13} /> Request Signature
              </button>
            )}
          </div>

          {signatures.length === 0 ? (
            <div className="empty" style={{ padding: 24, textAlign: 'center' }}>
              {contract.status === 'signature' ? (
                <div>
                  <p style={{ marginBottom: 12, color: '#64748b' }}>
                    Approvals complete! Ready to initiate signature workflow.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowSignModal(true)}>
                    <FileSignature size={15} /> Request Signature Now
                  </button>
                </div>
              ) : (
                'No signature requests recorded.'
              )}
            </div>
          ) : (
            signatures.map((s: any, idx: number) => {
              const req = s.request || s;
              const participants = s.participants || (s.signers ?? []);
              const currentUserId = currentUser?.user?._id;
              return (
                <div key={req._id || idx} style={{ padding: 12, borderTop: '1px solid #eef2f4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>Signature Request</strong>
                      <span className="badge badge-grey" style={{ marginLeft: 6, fontSize: 10 }}>
                        {req.provider || 'mock'}
                      </span>
                    </div>
                    <span
                      className={`badge badge-${
                        req.status === 'completed' ? 'green' : req.status === 'declined' ? 'red' : 'orange'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {participants.map((p: any, pIdx: number) => {
                      const isCurrentUser = p.userId && String(p.userId) === String(currentUserId);
                      const isPending = p.status === 'pending';
                      return (
                        <div
                          key={p._id || pIdx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: 6,
                            backgroundColor: isCurrentUser && isPending ? '#fef3c7' : '#f8fafc',
                            border: isCurrentUser && isPending ? '1px solid #fcd34d' : '1px solid transparent',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              {getUserDisplayName(p.userId)}
                              {isCurrentUser && <span style={{ color: '#d97706', marginLeft: 6 }}>(You)</span>}
                            </div>
                            <div className="panel-caption">
                              Order #{p.signingOrder || pIdx + 1} · Status: {p.status}
                              {p.signedAt && ` · Signed on ${new Date(p.signedAt).toLocaleDateString()}`}
                              {p.declineReason && ` · Reason: ${p.declineReason}`}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {isCurrentUser && isPending ? (
                              <>
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '4px 10px', fontSize: 12, backgroundColor: '#1d9365' }}
                                  disabled={busy}
                                  onClick={() => handleCompleteSignature(req._id)}
                                >
                                  <CheckCircle2 size={13} /> Sign
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626' }}
                                  disabled={busy}
                                  onClick={() => handleDeclineSignature(req._id)}
                                >
                                  <XCircle size={13} /> Decline
                                </button>
                              </>
                            ) : (
                              <span
                                className={`badge badge-${
                                  p.status === 'signed' ? 'green' : p.status === 'declined' ? 'red' : 'grey'
                                }`}
                              >
                                {p.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </TiltCard>
      </div>

      <div className="grid-2">
        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header">
            <div>
              <h2>
                <FileClock size={17} style={{ verticalAlign: 'middle', marginRight: 7, color: '#1d9365' }} /> Versions
              </h2>
              <div className="panel-caption">Immutable contract version history</div>
            </div>
          </div>
          {versions.length === 0 ? (
            <div className="empty" style={{ padding: 24, textAlign: 'center' }}>
              No versions recorded.
            </div>
          ) : (
            versions.map((v) => (
              <div key={v._id} style={{ padding: 12, borderTop: '1px solid #eef2f4' }}>
                <strong>Version {v.versionNumber}</strong>
                <div className="panel-caption">
                  {v.changeSummary ?? v.state ?? '—'} ·{' '}
                  {v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}
                </div>
              </div>
            ))
          )}
        </TiltCard>

        <TiltCard className="card panel" maxTilt={2}>
          <div className="panel-header">
            <div>
              <h2>
                <History size={17} style={{ verticalAlign: 'middle', marginRight: 7, color: '#3b6590' }} /> Audit history
              </h2>
              <div className="panel-caption">Append-only activity timeline</div>
            </div>
          </div>
          {history.length === 0 ? (
            <div className="empty" style={{ padding: 24, textAlign: 'center' }}>
              No audit events recorded.
            </div>
          ) : (
            history.slice(0, 8).map((h: any) => (
              <div key={h._id} style={{ padding: 11, borderTop: '1px solid #eef2f4' }}>
                <strong>{h.action}</strong>
                <div className="panel-caption">
                  {h.timestamp ? new Date(h.timestamp).toLocaleString() : '—'} · {h.result ?? 'success'}
                </div>
              </div>
            ))
          )}
        </TiltCard>
      </div>
    </>
  );
}
