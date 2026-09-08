import { FormEvent, useState } from 'react';
import { ArrowLeft, DollarSign, Save, ShieldCheck } from 'lucide-react';
import { endpoints } from '../services/api';
import { contractCreateSchema, parseForm } from '../services/types';

export function ContractCreate({ navigate }: { navigate: (path: string) => void }) {
  const [form, setForm] = useState({
    contractNumber: '',
    title: '',
    contractType: 'service',
    effectiveDate: '',
    expiryDate: '',
    value: '',
    currency: 'USD',
    partyName: '',
    partyRole: 'counterparty',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      // Clean and sanitize financial value (strip commas, spaces, currency symbols)
      const cleanValue = form.value ? form.value.replace(/[^0-9.]/g, '').trim() : '';

      const payload = parseForm(contractCreateSchema, {
        contractNumber: form.contractNumber.trim(),
        title: form.title.trim(),
        contractType: form.contractType.trim(),
        parties: form.partyName.trim()
          ? [{ name: form.partyName.trim(), role: form.partyRole }]
          : [],
        ...(form.effectiveDate ? { effectiveDate: new Date(form.effectiveDate).toISOString() } : {}),
        ...(form.expiryDate ? { expiryDate: new Date(form.expiryDate).toISOString() } : {}),
        ...(cleanValue ? { financial: { value: cleanValue, currency: form.currency.toUpperCase().trim() || 'USD' } } : {}),
      });

      const contract = await endpoints.createContract(payload);
      navigate(`/contracts/${contract._id}`);
    } catch (e: any) {
      setError(e.issues?.[0]?.message ?? e.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <div className="page-heading">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('/contracts')}>
            <ArrowLeft size={15} /> Contracts
          </button>
          <div className="eyebrow" style={{ marginTop: 18 }}>Authoring workspace</div>
          <h1>New contract</h1>
          <p className="subtitle">Create a governed draft before review and approval.</p>
        </div>
      </div>

      <section className="card panel" style={{ maxWidth: 980 }}>
        {error && <div className="notice" style={{ marginBottom: 18 }}>{error}</div>}

        <div className="panel-header">
          <div>
            <h2>Contract details</h2>
            <div className="panel-caption">Fields are validated before transmission to CovenX.</div>
          </div>
          <ShieldCheck size={19} color="#1d9365" />
        </div>

        <form className="form-grid" onSubmit={submit}>
          <div className="field">
            <label htmlFor="contractNumber">Contract number *</label>
            <input
              id="contractNumber"
              required
              placeholder="e.g. CTR-2026-001"
              value={form.contractNumber}
              onChange={(e) => set('contractNumber', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="contractType">Contract type *</label>
            <select
              id="contractType"
              value={form.contractType}
              onChange={(e) => set('contractType', e.target.value)}
            >
              <option value="service">Service (Master Services Agreement)</option>
              <option value="software_license">Software License / SaaS</option>
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
              <option value="vendor">Vendor Agreement</option>
              <option value="procurement">Procurement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field full">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              required
              placeholder="e.g. Master Cloud Services & SLA Agreement"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="partyName">Counterparty name</label>
            <input
              id="partyName"
              placeholder="e.g. Apex Cloud Technologies Inc."
              value={form.partyName}
              onChange={(e) => set('partyName', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="partyRole">Party role</label>
            <select
              id="partyRole"
              value={form.partyRole}
              onChange={(e) => set('partyRole', e.target.value)}
            >
              <option value="counterparty">Counterparty</option>
              <option value="supplier">Supplier</option>
              <option value="customer">Customer</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="effectiveDate">Effective date</label>
            <input
              id="effectiveDate"
              type="date"
              value={form.effectiveDate}
              onChange={(e) => set('effectiveDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="expiryDate">Expiry date</label>
            <input
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={(e) => set('expiryDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="value">Contract value ($ / Amount)</label>
            <input
              id="value"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50000 or 50000.00"
              value={form.value}
              onChange={(e) => {
                // Allow only digits and a single decimal point while typing
                const val = e.target.value.replace(/[^0-9.]/g, '');
                set('value', val);
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="currency">Currency (3-letter ISO code)</label>
            <input
              id="currency"
              maxLength={3}
              placeholder="USD"
              value={form.currency}
              onChange={(e) => set('currency', e.target.value.toUpperCase())}
            />
          </div>

          <div className="field full" style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, flexDirection: 'row', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/contracts')}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={busy} type="submit">
              <Save size={15} /> {busy ? 'Saving…' : 'Create draft'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
