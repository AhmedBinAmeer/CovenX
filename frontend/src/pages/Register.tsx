import { FormEvent, useState } from 'react';
import { ArrowRight, Building2, Check, ChevronLeft, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../main';
import { TiltCard, Reveal } from '../components/Motion';

export function Register({ navigate }: { navigate: (path: string) => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    workspaceSlug: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    industry: '',
    companySize: '',
    contractVolume: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        companyName: form.companyName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        workspaceSlug: form.workspaceSlug.trim() || undefined,
        industry: form.industry.trim() || undefined,
        companySize: form.companySize || undefined,
        contractVolume: form.contractVolume || undefined,
      };
      await register(payload);
    } catch (e: any) {
      setError(e.message ?? 'Unable to create your workspace');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="register-layout">
      <aside className="register-aside">
        <Reveal direction="up" delay={40}>
          <button className="brand-button register-brand" onClick={() => navigate('/')} aria-label="CovenX home">
            <div className="brand-badge">
              <img className="brand-badge-logo" src="/covenx-logo-transparent.png" alt="CovenX" />
            </div>
            <div className="brand-copy">
              <strong>CovenX</strong>
              <small>Enterprise contract intelligence</small>
            </div>
          </button>
          <div className="register-aside-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Build your contract operation</div>
            <h1>A secure workspace for every agreement.</h1>
            <p>
              Start with a tenant-isolated CovenX workspace, invite your team, and bring every contract from request to renewal under one governed operating model.
            </p>
            <div className="register-proof">
              <span><Check size={14} /> 14-day guided trial</span>
              <span><Check size={14} /> First administrator included</span>
              <span><Check size={14} /> No credit card required</span>
            </div>
          </div>
        </Reveal>
        <div className="register-aside-footer">
          <ShieldCheck size={14} /> Secure by design · CovenX Enterprise
        </div>
      </aside>

      <main className="register-main">
        <div className="register-topline">
          <button className="text-button" onClick={() => navigate('/login')}>
            <ChevronLeft size={15} /> Already have access? Sign in
          </button>
          <span className="badge badge-green">
            <Sparkles size={12} /> Workspace setup
          </span>
        </div>

        <Reveal direction="scale" delay={80}>
          <TiltCard maxTilt={1.5}>
            <form className="register-card" onSubmit={submit}>
              <div className="eyebrow">Create your workspace</div>
              <h2>Start with the essentials.</h2>
              <p className="subtitle">Your company becomes a separate, tenant-isolated CovenX organization.</p>

              <div className="register-section-heading">
                <Building2 size={16} />
                <span>Company profile</span>
              </div>

              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="company-name">Company name</label>
                  <input
                    id="company-name"
                    required
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    placeholder="e.g. Northstar Holdings"
                    autoComplete="organization"
                  />
                </div>
                <div className="field">
                  <label htmlFor="workspace-slug">Workspace slug <span>optional</span></label>
                  <input
                    id="workspace-slug"
                    pattern="[a-z0-9-]+"
                    value={form.workspaceSlug}
                    onChange={(e) => update('workspaceSlug', e.target.value.toLowerCase())}
                    placeholder="northstar"
                  />
                  <small>Used when signing in again.</small>
                </div>
                <div className="field">
                  <label htmlFor="company-industry">Industry <span>optional</span></label>
                  <input
                    id="company-industry"
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    placeholder="Technology, finance…"
                  />
                </div>
                <div className="field">
                  <label htmlFor="company-size">Company size <span>optional</span></label>
                  <select
                    id="company-size"
                    value={form.companySize}
                    onChange={(e) => update('companySize', e.target.value)}
                  >
                    <option value="">Select size</option>
                    <option>1–50</option>
                    <option>51–250</option>
                    <option>251–1,000</option>
                    <option>1,001–5,000</option>
                    <option>5,000+</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="contract-volume">Contract volume <span>optional</span></label>
                  <select
                    id="contract-volume"
                    value={form.contractVolume}
                    onChange={(e) => update('contractVolume', e.target.value)}
                  >
                    <option value="">Select volume</option>
                    <option>Under 500</option>
                    <option>500–5,000</option>
                    <option>5,000–50,000</option>
                    <option>50,000+</option>
                  </select>
                </div>
              </div>

              <div className="register-section-heading">
                <LockKeyhole size={16} />
                <span>Workspace administrator</span>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="admin-first-name">First name</label>
                  <input
                    id="admin-first-name"
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="admin-last-name">Last name</label>
                  <input
                    id="admin-last-name"
                    required
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                <div className="field full">
                  <label htmlFor="admin-email">Work email</label>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
                <div className="field full">
                  <label htmlFor="admin-password">Password</label>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    minLength={12}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="At least 12 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <div className="notice register-error">{error}</div>}

              <label className="consent-row">
                <input
                  type="checkbox"
                  required
                  checked={form.termsAccepted}
                  onChange={(e) => update('termsAccepted', e.target.checked)}
                />
                <span>I agree to the CovenX terms and privacy policy.</span>
              </label>

              <button className="btn btn-primary register-submit" disabled={busy}>
                {busy ? 'Creating secure workspace…' : <>Create workspace <ArrowRight size={16} /></>}
              </button>

              <p className="register-footnote">
                By continuing, CovenX creates an isolated trial tenant and assigns you as its first workspace administrator.
              </p>
            </form>
          </TiltCard>
        </Reveal>
      </main>
    </div>
  );
}
