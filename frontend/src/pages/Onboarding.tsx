import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, Check, CheckCircle2, ChevronLeft, ChevronRight, Cable, Users, Workflow, Sparkles } from 'lucide-react';
import { endpoints } from '../services/api';
import { TiltCard, Reveal } from '../components/Motion';

const steps = [
  { key: 'profile', label: 'Company profile', icon: Building2, copy: 'Tell CovenX about your operating context.' },
  { key: 'team', label: 'Invite your team', icon: Users, copy: 'Prepare your first legal, finance, and business users.' },
  { key: 'governance', label: 'Set governance', icon: Workflow, copy: 'Choose the operating controls your team needs.' },
  { key: 'integrations', label: 'Connect systems', icon: Cable, copy: 'Connect providers when your environment is ready.' },
];

export function Onboarding({ navigate }: { navigate: (path: string) => void }) {
  const [organization, setOrganization] = useState<any>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({ name: '', industry: '', companySize: '', contractVolume: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    endpoints.onboarding().then((value) => {
      setOrganization(value);
      const current = steps.findIndex((step) => step.key === value?.onboarding?.currentStep);
      setStepIndex(current >= 0 ? current : 0);
      setForm({
        name: value?.name ?? '',
        industry: value?.profile?.industry ?? '',
        companySize: value?.profile?.companySize ?? '',
        contractVolume: value?.profile?.contractVolume ?? '',
      });
    }).catch((e) => setError(e.message));
  }, []);

  const step = steps[stepIndex];
  const completed = useMemo(() => new Set<string>(organization?.onboarding?.completedSteps ?? []), [organization]);

  const saveStep = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!step) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = step.key === 'profile' ? form : { ready: true };
      const saved = await endpoints.updateOnboarding({ step: step.key, data });
      setOrganization(saved);
      setNotice(`${step.label} saved.`);
      if (stepIndex < steps.length - 1) setStepIndex((index) => index + 1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      const saved = await endpoints.updateOnboarding({ step: 'complete', data: {} });
      setOrganization(saved);
      navigate('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <button className="brand-button onboarding-brand" onClick={() => navigate('/')} aria-label="CovenX home">
          <div className="brand-badge" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <img className="brand-badge-logo" src="/covenx-logo-transparent.png" alt="CovenX" style={{ width: 34, height: 34 }} />
          </div>
          <div className="brand-copy">
            <strong>CovenX</strong>
            <small>Enterprise contract intelligence</small>
          </div>
        </button>
        <span className="badge badge-green">
          <Sparkles size={13} /> Workspace setup
        </span>
      </header>

      <main className="onboarding-main">
        <Reveal direction="up" delay={40}>
          <div className="onboarding-intro">
            <div className="eyebrow">Welcome to CovenX</div>
            <h1>Shape your contract operation.</h1>
            <p>Set up the essentials now. You can refine every policy, template, and integration later from the workspace.</p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={80}>
          <div className="onboarding-progress">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`${index === stepIndex ? 'active' : ''} ${completed.has(item.key) ? 'complete' : ''}`}
                  onClick={() => setStepIndex(index)}
                >
                  <span className="onboarding-step-icon">
                    {completed.has(item.key) ? <Check size={15} /> : <Icon size={15} />}
                  </span>
                  <span>
                    <strong>0{index + 1}</strong>{item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {notice && <div className="notice onboarding-notice"><CheckCircle2 size={15} /> {notice}</div>}
        {error && <div className="notice onboarding-notice">{error}</div>}

        <Reveal direction="scale" delay={120}>
          <section className="card onboarding-card">
              <div className="onboarding-card-heading">
                <div>
                  <span className="eyebrow">Step 0{stepIndex + 1} of 04</span>
                  <h2>{step?.label}</h2>
                  <p>{step?.copy}</p>
                </div>
                <span className="onboarding-percent">
                  {Math.round(((stepIndex + (completed.has(step?.key) ? 1 : 0)) / steps.length) * 100)}%
                </span>
              </div>

              {step?.key === 'profile' && (
                <form className="form-grid" onSubmit={saveStep}>
                  <div className="field full">
                    <label htmlFor="onboarding-company">Company name</label>
                    <input
                      id="onboarding-company"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="onboarding-industry">Industry</label>
                    <input
                      id="onboarding-industry"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="Technology, finance…"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="onboarding-size">Company size</label>
                    <select
                      id="onboarding-size"
                      value={form.companySize}
                      onChange={(e) => setForm({ ...form, companySize: e.target.value })}
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
                    <label htmlFor="onboarding-volume">Contract volume</label>
                    <select
                      id="onboarding-volume"
                      value={form.contractVolume}
                      onChange={(e) => setForm({ ...form, contractVolume: e.target.value })}
                    >
                      <option value="">Select volume</option>
                      <option>Under 500</option>
                      <option>500–5,000</option>
                      <option>5,000–50,000</option>
                      <option>50,000+</option>
                    </select>
                  </div>
                  <div className="onboarding-actions">
                    <button className="btn btn-primary" disabled={busy}>
                      {busy ? 'Saving…' : <>Save and continue <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </form>
              )}

              {step?.key === 'team' && (
                <div className="onboarding-choice">
                  <div className="onboarding-choice-icon"><Users size={21} /></div>
                  <div>
                    <h3>Invite people after setup</h3>
                    <p>Your workspace administrator is ready. You can invite legal, procurement, finance, executives, and business requesters from Users once the workspace is active.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveStep()} disabled={busy}>
                    Mark ready <Check size={15} />
                  </button>
                </div>
              )}

              {step?.key === 'governance' && (
                <div className="onboarding-choice">
                  <div className="onboarding-choice-icon"><Workflow size={21} /></div>
                  <div>
                    <h3>Start with governed defaults</h3>
                    <p>CovenX will keep templates, clauses, workflows, and permissions ready for configuration. You can tailor approval policy before your first submission.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveStep()} disabled={busy}>
                    Use defaults <Check size={15} />
                  </button>
                </div>
              )}

              {step?.key === 'integrations' && (
                <div className="onboarding-choice">
                  <div className="onboarding-choice-icon"><Cable size={21} /></div>
                  <div>
                    <h3>Connect providers when ready</h3>
                    <p>DocuSign, Salesforce, and Slack can be connected later from Integrations. No provider credentials are required to start your secure workspace.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => void saveStep()} disabled={busy}>
                    Continue without integrations <ArrowRight size={15} />
                  </button>
                </div>
              )}

              <div className="onboarding-footer">
                <button
                  className="text-button"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                >
                  <ChevronLeft size={15} /> Back
                </button>
                {stepIndex === steps.length - 1 && (
                  <button className="btn btn-primary" onClick={() => void finish()} disabled={busy}>
                    Finish workspace setup <CheckCircle2 size={15} />
                  </button>
                )}
                {stepIndex < steps.length - 1 && completed.has(step?.key) && (
                  <button
                    className="text-button"
                    onClick={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </section>
        </Reveal>
      </main>
    </div>
  );
}
