import { ArrowRight, Bot, CheckCircle2, ChevronRight, FileCheck2, Github, Globe, Linkedin, LockKeyhole, Mail, MapPin, Phone, Radar, Shield, ShieldCheck, Sparkles, Twitter, Workflow } from 'lucide-react';
import { ParallaxLayer, TiltCard } from '../components/Motion';

const lifecycle = [
  { icon: FileCheck2, label: 'Create', copy: 'Start from governed templates and clause intelligence.' },
  { icon: Workflow, label: 'Review', copy: 'Coordinate legal, procurement, finance, and business owners.' },
  { icon: CheckCircle2, label: 'Approve', copy: 'Route decisions through policy-aware approval workflows.' },
  { icon: Radar, label: 'Monitor', copy: 'Track obligations, renewals, risk, and performance.' },
];

const signals = [
  ['Active portfolio', '2,418', '+18.4%'],
  ['Approval velocity', '86%', 'This quarter'],
  ['Renewal exposure', '$4.8M', 'Next 90 days'],
];

export function Landing({ onEnter, onRegister }: { onEnter: () => void; onRegister: () => void }) {
  return <div className="landing-page">
    <div className="landing-grid" aria-hidden="true" />
    <div className="landing-orb landing-orb-green" aria-hidden="true" />
    <div className="landing-orb landing-orb-orange" aria-hidden="true" />
    <header className="landing-nav">
      <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="CovenX home">
        <img src="/covenx-logo-transparent.png" alt="CovenX" />
        <span><strong>CovenX</strong><small>Enterprise contract intelligence</small></span>
      </button>
      <nav className="landing-links" aria-label="Marketing navigation">
        <a href="#platform">Platform</a><a href="#security">Security</a><a href="#intelligence">Intelligence</a>
      </nav>
      <div className="landing-nav-actions"><button className="landing-text-link" onClick={onRegister}>Create workspace</button><button className="btn landing-nav-cta" onClick={onEnter}>Enter workspace <ArrowRight size={15} /></button></div>
    </header>

    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <div className="eyebrow landing-eyebrow"><span className="eyebrow-dot" /> Contract intelligence, secured</div>
          <h1 id="landing-title">Move every agreement forward <em>with confidence.</em></h1>
          <p className="landing-lede">CovenX is the enterprise Contract Lifecycle Management Platform for teams that need to create, review, approve, sign, monitor, renew, and archive agreements with intelligence and control.</p>
          <div className="landing-actions"><button className="btn landing-primary" onClick={onRegister}>Create your company workspace <ArrowRight size={17} /></button><button className="landing-text-link" onClick={onEnter}>Already have access? Sign in <ChevronRight size={15} /></button></div>
          <div className="landing-trust-row"><span><ShieldCheck size={15} /> Tenant-isolated by design</span><span><LockKeyhole size={15} /> Governed human review</span></div>
        </div>
        <ParallaxLayer className="landing-visual" depth={0.06} aria-label="CovenX contract operations preview">
          <div className="visual-halo" aria-hidden="true" />
          <TiltCard className="dashboard-preview glass-panel" maxTilt={3}>
            <div className="preview-top"><div><span className="preview-kicker">COVENX / COMMAND CENTER</span><strong>Portfolio pulse</strong></div><span className="preview-live"><i /> Live</span></div>
            <div className="preview-metrics">{signals.map(([label, value, meta], index) => <div className="preview-metric" key={label} style={{ animationDelay: `${index * 120}ms` }}><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>)}</div>
            <div className="preview-chart"><div className="chart-label"><span>Contract health index</span><strong>94.2</strong></div><div className="chart-lines"><i /><i /><i /><i /><i /><i /><i /><i /></div><svg viewBox="0 0 500 150" preserveAspectRatio="none" role="img" aria-label="Contract health trend rising"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#41c78e" stopOpacity=".34" /><stop offset="1" stopColor="#41c78e" stopOpacity="0" /></linearGradient></defs><path d="M0 128 C38 118, 54 120, 80 108 S126 118, 150 91 S192 102, 220 82 S256 87, 287 58 S330 68, 352 54 S395 61, 420 32 S460 45, 500 12 L500 150 L0 150 Z" fill="url(#chartFill)" /><path d="M0 128 C38 118, 54 120, 80 108 S126 118, 150 91 S192 102, 220 82 S256 87, 287 58 S330 68, 352 54 S395 61, 420 32 S460 45, 500 12" fill="none" stroke="#54d69b" strokeWidth="3" /></svg></div>
            <div className="preview-bottom"><span><Bot size={15} /> AI risk review active</span><span className="preview-secure"><ShieldCheck size={14} /> Protected</span></div>
          </TiltCard>
          <div className="floating-card floating-card-risk"><span className="float-icon orange"><Sparkles size={15} /></span><div><strong>3 risks surfaced</strong><small>Evidence-linked review</small></div></div>
          <div className="floating-card floating-card-secure"><span className="float-icon green"><CheckCircle2 size={15} /></span><div><strong>Policy aligned</strong><small>Approval checkpoint cleared</small></div></div>
        </ParallaxLayer>
      </section>

      <section className="landing-proof" aria-label="CovenX platform outcomes"><span>BUILT FOR HIGH-STAKES AGREEMENTS</span><div><strong>TRUST</strong><strong>CONTROL</strong><strong>VELOCITY</strong><strong>INTELLIGENCE</strong></div></section>

      <section className="landing-section" id="platform"><div className="section-intro"><div className="eyebrow">One operating system for every agreement</div><h2>From first draft to final obligation.</h2><p>Replace fragmented handoffs with a secure, visible contract operation that gives every stakeholder the context to act.</p></div><div className="lifecycle-grid">{lifecycle.map(({ icon: Icon, label, copy }, index) => <article className="lifecycle-card" key={label}><span className="lifecycle-number">0{index + 1}</span><Icon size={22} /><h3>{label}</h3><p>{copy}</p><ChevronRight size={16} /></article>)}</div></section>

      <section className="landing-section landing-split" id="intelligence"><div className="split-visual glass-panel"><div className="split-header"><Bot size={18} /><span>GOVERNED INTELLIGENCE</span><span className="split-status">Human review required</span></div><div className="ai-summary"><div className="ai-avatar"><Sparkles size={18} /></div><div><strong>Executive summary ready</strong><p>Evidence-linked insights across commercial terms, renewal exposure, and obligations.</p></div></div><div className="evidence-row"><span>Clause 14.2</span><span>Liability cap</span><b>Verified</b></div><div className="evidence-row"><span>Schedule B</span><span>Renewal notice</span><b>Review</b></div></div><div className="section-intro"><div className="eyebrow">Intelligence without the black box</div><h2>AI that shows its work.</h2><p>CovenX helps teams move faster without surrendering judgment. Every summary, extracted term, risk, and answer is grounded in tenant-scoped evidence and routed through human review.</p><button className="landing-outline" onClick={onEnter}>See the intelligence workspace <ArrowRight size={15} /></button></div></section>

      <section className="landing-section security-section" id="security"><div className="security-badge"><ShieldCheck size={22} /></div><div className="section-intro"><div className="eyebrow">Enterprise trust, operationalized</div><h2>Security is part of the workflow.</h2><p>Role-based access, audit trails, secure document management, data isolation, and governed lifecycle controls are built into the CovenX operating model.</p><div className="security-pills"><span>RBAC</span><span>Audit-ready</span><span>Tenant isolated</span><span>Lifecycle governed</span></div></div></section>
    </main>
    <footer className="landing-footer-container">
      <div className="landing-footer-cta-banner glass-panel">
        <div className="cta-banner-content">
          <div className="eyebrow"><Sparkles size={14} /> Ready to modernize contract operations?</div>
          <h2>Bring enterprise intelligence and security to every agreement.</h2>
          <p>Join high-velocity legal, procurement, and finance teams operating on CovenX.</p>
        </div>
        <div className="cta-banner-actions">
          <button className="btn landing-primary" onClick={onRegister}>
            Create your company workspace <ArrowRight size={16} />
          </button>
          <button className="landing-text-link" onClick={onEnter}>
            Sign in to existing workspace <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="landing-footer-main">
        <div className="footer-brand-col">
          <button className="brand-button landing-footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="CovenX home">
            <div className="brand-badge">
              <img className="brand-badge-logo" src="/covenx-logo-transparent.png" alt="CovenX" />
            </div>
            <div className="brand-copy">
              <strong>CovenX</strong>
              <small>Enterprise contract intelligence</small>
            </div>
          </button>
          <p className="footer-tagline">
            The next-generation Contract Lifecycle Management Platform engineered for security, compliance, and enterprise velocity.
          </p>
          <div className="footer-compliance-badges">
            <span className="compliance-pill"><ShieldCheck size={13} /> SOC 2 Type II</span>
            <span className="compliance-pill"><LockKeyhole size={13} /> ISO 27001</span>
            <span className="compliance-pill"><CheckCircle2 size={13} /> GDPR Ready</span>
          </div>
          <div className="footer-social-row">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter / X">
              <Twitter size={16} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
              <Github size={16} />
            </a>
            <a href="https://covenx.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Global Web">
              <Globe size={16} />
            </a>
          </div>
        </div>

        <div className="footer-nav-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="#platform">Contract Lifecycle</a></li>
            <li><a href="#intelligence">AI Risk Extraction</a></li>
            <li><a href="#security">Enterprise Approvals</a></li>
            <li><button className="footer-link-btn" onClick={onRegister}>Obligation Manager</button></li>
            <li><button className="footer-link-btn" onClick={onRegister}>Clause Intelligence</button></li>
            <li><button className="footer-link-btn" onClick={onRegister}>Renewal Pipeline</button></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h4>Security & Trust</h4>
          <ul>
            <li><a href="#security">Tenant Isolation</a></li>
            <li><a href="#security">Role-Based Access (RBAC)</a></li>
            <li><button className="footer-link-btn" onClick={onEnter}>Audit History</button></li>
            <li><a href="#security">Malware File Scanning</a></li>
            <li><a href="#security">Data Encryption at Rest</a></li>
            <li><a href="#security">Compliance Posture</a></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#platform">About CovenX</a></li>
            <li><button className="footer-link-btn" onClick={onRegister}>Guided 14-day Trial</button></li>
            <li><button className="footer-link-btn" onClick={onEnter}>Workspace Portal</button></li>
            <li><a href="#platform">Privacy Policy</a></li>
            <li><a href="#platform">Terms of Service</a></li>
            <li><a href="#intelligence">Responsible AI</a></li>
          </ul>
        </div>

        <div className="footer-nav-col footer-contact-col">
          <h4>Contact & Support</h4>
          <div className="contact-list">
            <a href="mailto:sales@covenx.com" className="contact-item">
              <Mail size={15} />
              <span>sales@covenx.com</span>
            </a>
            <a href="mailto:support@covenx.com" className="contact-item">
              <Shield size={15} />
              <span>support@covenx.com</span>
            </a>
            <div className="contact-item">
              <Phone size={15} />
              <span>+1 (888) 420-COVEN</span>
            </div>
            <div className="contact-item">
              <MapPin size={15} />
              <span>100 Montgomery St, Suite 1800, San Francisco, CA</span>
            </div>
            <div className="contact-item status-live">
              <span className="live-dot" />
              <span>24/7 Enterprise Support SLA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <div className="footer-bottom-left">
          <span>© {new Date().getFullYear()} CovenX Enterprise Platform. All rights reserved.</span>
          <span className="footer-tagline-sub">Intelligent contract operations for high-stakes agreements.</span>
        </div>
        <div className="footer-bottom-right">
          <span className="system-status-indicator">
            <span className="pulse-dot" /> All Systems Operational (99.99% SLA)
          </span>
        </div>
      </div>
    </footer>
  </div>;
}
