import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Github,
  Globe,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Radar,
  Shield,
  ShieldCheck,
  Sparkles,
  Twitter,
  Workflow,
  Layers,
  Zap,
} from 'lucide-react';
import { ParallaxLayer, TiltCard, Reveal } from '../components/Motion';
import { HelpdeskChatbot } from '../components/HelpdeskChatbot';

const lifecycle = [
  { icon: FileCheck2, label: 'Intake & Authoring', copy: 'Generate standard agreements from locked clause templates with dynamic governance.' },
  { icon: Workflow, label: 'Approval Workflows', copy: 'Route contracts through policy-driven linear or parallel approval chains automatically.' },
  { icon: Bot, label: 'AI Review & Extraction', copy: 'Extract terms, surface non-standard clauses, and calculate risk scores with audit trails.' },
  { icon: Radar, label: 'Obligation Tracking', copy: 'Map deliverables, milestones, renewal notices, and operational SLAs in real time.' },
];

const signals: Array<[string, string, string]> = [
  ['Active Agreements', '1,420', '+18% this quarter'],
  ['Approval Velocity', '1.8 days', 'Down from 6.4d'],
  ['Auto-extracted Terms', '99.4%', 'Audited and verified'],
];

export function Landing({ onEnter, onRegister }: { onEnter: () => void; onRegister: () => void }) {
  const [activeSection, setActiveSection] = useState<'hero' | 'platform' | 'intelligence' | 'security'>('hero');
  const progressRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
      if (headerRef.current) {
        headerRef.current.classList.toggle('is-scrolled', scrollY > 24);
      }
      if (promptRef.current) {
        promptRef.current.classList.toggle('is-hidden', scrollY > 60);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    // High performance IntersectionObserver for section highlighting
    const sections = ['platform', 'intelligence', 'security'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as any);
          }
        });
        if (window.scrollY < 300) {
          setActiveSection('hero');
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0.05 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* ── Living Animated Ambient Background ──────────────────────────── */}
      <div className="landing-aurora-mesh" aria-hidden="true">
        <div className="aurora-beam aurora-beam-1" />
        <div className="aurora-beam aurora-beam-2" />
        <div className="aurora-beam aurora-beam-3" />
      </div>

      <div className="landing-plasma-system" aria-hidden="true">
        <div className="plasma-orb plasma-orb-emerald" />
        <div className="plasma-orb plasma-orb-copper" />
        <div className="plasma-orb plasma-orb-cyan" />
        <div className="plasma-orb plasma-orb-indigo" />
      </div>

      <div className="landing-grid-interactive" aria-hidden="true" />
      <div className="landing-starfield" aria-hidden="true">
        <i style={{ top: '15%', left: '20%', animationDelay: '0s' }} />
        <i style={{ top: '28%', left: '82%', animationDelay: '1.2s' }} />
        <i style={{ top: '48%', left: '12%', animationDelay: '2.4s' }} />
        <i style={{ top: '65%', left: '74%', animationDelay: '0.8s' }} />
        <i style={{ top: '82%', left: '35%', animationDelay: '1.9s' }} />
        <i style={{ top: '92%', left: '88%', animationDelay: '3.1s' }} />
      </div>

      {/* ── Strict Floating Elevated Capsule Navigation Bar ────────────── */}
      <header ref={headerRef} className="landing-nav-floating">
        <div ref={progressRef} className="landing-nav-progress" style={{ width: '0%' }} />
        <div className="landing-nav-inner">
          <button
            className="landing-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="CovenX home"
          >
            <div className="brand-badge-nav">
              <img src="/covenx-logo-transparent.png" alt="CovenX" />
            </div>
            <span className="brand-titles">
              <strong>CovenX</strong>
              <small>Enterprise Intelligence</small>
            </span>
          </button>

          <nav className="landing-links" aria-label="Landing navigation">
            <button
              className={`nav-link-pill ${activeSection === 'platform' ? 'active' : ''}`}
              onClick={() => scrollTo('platform')}
            >
              Platform
            </button>
            <button
              className={`nav-link-pill ${activeSection === 'intelligence' ? 'active' : ''}`}
              onClick={() => scrollTo('intelligence')}
            >
              Intelligence
            </button>
            <button
              className={`nav-link-pill ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => scrollTo('security')}
            >
              Security
            </button>
          </nav>

          <div className="landing-nav-actions">
            <button className="landing-text-link landing-text-link-compact" onClick={onRegister}>
              Create workspace
            </button>
            <button className="btn landing-nav-cta" onClick={onEnter}>
              <span>Enter workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <Reveal direction="up" delay={40} className="landing-hero-copy">
            <div className="eyebrow landing-eyebrow">
              <span className="eyebrow-dot" />
              <Sparkles size={13} />
              <span>Contract intelligence, secured</span>
            </div>
            <h1 id="landing-title">
              Move every agreement forward <em>with confidence.</em>
            </h1>
            <p className="landing-lede">
              CovenX is the enterprise Contract Lifecycle Management Platform for teams that need to create, review, approve, sign, monitor, renew, and archive agreements with intelligence and control.
            </p>
            <div className="landing-actions">
              <button className="btn landing-primary" onClick={onRegister}>
                Create your company workspace <ArrowRight size={17} />
              </button>
              <button className="landing-text-link" onClick={onEnter}>
                Already have access? Sign in <ChevronRight size={15} />
              </button>
            </div>
            <div className="landing-trust-row">
              <span><ShieldCheck size={15} /> Tenant-isolated by design</span>
              <span><LockKeyhole size={15} /> Governed human review</span>
              <span><Zap size={15} /> Real-time automation</span>
            </div>
          </Reveal>

          <div className="landing-visual" aria-label="CovenX contract operations preview">
            <div className="visual-halo" aria-hidden="true" />
            <div className="dashboard-preview glass-panel">
              <div className="preview-top">
                <div>
                  <span className="preview-kicker">COVENX / COMMAND CENTER</span>
                  <strong>Portfolio pulse</strong>
                </div>
                <span className="preview-live"><i /> Live</span>
              </div>
              <div className="preview-metrics">
                {signals.map(([label, value, meta], index) => (
                  <div className="preview-metric" key={label} style={{ animationDelay: `${index * 120}ms` }}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{meta}</small>
                  </div>
                ))}
              </div>
              <div className="preview-chart">
                <div className="chart-label">
                  <span>Contract health index</span>
                  <strong>94.2</strong>
                </div>
                <div className="chart-lines"><i /><i /><i /><i /><i /><i /><i /><i /></div>
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" role="img" aria-label="Contract health trend rising">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#41c78e" stopOpacity=".34" />
                      <stop offset="1" stopColor="#41c78e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 128 C38 118, 54 120, 80 108 S126 118, 150 91 S192 102, 220 82 S256 87, 287 58 S330 68, 352 54 S395 61, 420 32 S460 45, 500 12 L500 150 L0 150 Z" fill="url(#chartFill)" />
                  <path d="M0 128 C38 118, 54 120, 80 108 S126 118, 150 91 S192 102, 220 82 S256 87, 287 58 S330 68, 352 54 S395 61, 420 32 S460 45, 500 12" fill="none" stroke="#54d69b" strokeWidth="3" />
                </svg>
              </div>
              <div className="preview-bottom">
                <span><Bot size={15} /> AI risk review active</span>
                <span className="preview-secure"><ShieldCheck size={14} /> Protected</span>
              </div>
            </div>
            <div className="floating-card floating-card-risk">
              <span className="float-icon orange"><Sparkles size={15} /></span>
              <div><strong>3 risks surfaced</strong><small>Evidence-linked review</small></div>
            </div>
            <div className="floating-card floating-card-secure">
              <span className="float-icon green"><CheckCircle2 size={15} /></span>
              <div><strong>Policy aligned</strong><small>Approval checkpoint cleared</small></div>
            </div>
          </div>
        </section>

        {/* Scroll Indicator Prompt */}
        <div ref={promptRef} className="scroll-explore-prompt" onClick={() => scrollTo('platform')}>
          <div className="scroll-indicator-mouse">
            <span className="mouse-wheel" />
          </div>
          <span>Scroll to explore platform</span>
          <ArrowDown size={13} className="bounce-arrow" />
        </div>

        {/* Proof Bar */}
        <Reveal direction="scale" delay={50}>
          <section className="landing-proof" aria-label="CovenX platform outcomes">
            <div className="proof-heading">
              <Layers size={14} />
              <span>BUILT FOR HIGH-STAKES ENTERPRISE AGREEMENTS</span>
            </div>
            <div className="proof-tags">
              <strong>TRUST</strong>
              <strong>CONTROL</strong>
              <strong>VELOCITY</strong>
              <strong>INTELLIGENCE</strong>
            </div>
          </section>
        </Reveal>

        {/* Platform Lifecycle Section */}
        <Reveal direction="up" delay={70}>
          <section className="landing-section" id="platform">
            <div className="section-intro">
              <div className="eyebrow"><Sparkles size={13} /> One operating system for every agreement</div>
              <h2>From first draft to final obligation.</h2>
              <p>Replace fragmented handoffs with a secure, visible contract operation that gives every stakeholder the context to act.</p>
            </div>
            <div className="lifecycle-grid">
              {lifecycle.map(({ icon: Icon, label, copy }, index) => (
                <TiltCard key={label} maxTilt={5}>
                  <article className="lifecycle-card">
                    <span className="lifecycle-number">0{index + 1}</span>
                    <div className="lifecycle-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <h3>{label}</h3>
                    <p>{copy}</p>
                    <ChevronRight size={16} className="lifecycle-arrow" />
                  </article>
                </TiltCard>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Intelligence Section */}
        <Reveal direction="up" delay={70}>
          <section className="landing-section landing-split" id="intelligence">
            <TiltCard className="split-visual glass-panel" maxTilt={3}>
              <div className="split-header">
                <Bot size={18} /><span>GOVERNED INTELLIGENCE</span>
                <span className="split-status">Human review required</span>
              </div>
              <div className="ai-summary">
                <div className="ai-avatar"><Sparkles size={18} /></div>
                <div>
                  <strong>Executive summary ready</strong>
                  <p>Evidence-linked insights across commercial terms, renewal exposure, and obligations.</p>
                </div>
              </div>
              <div className="evidence-row"><span>Clause 14.2</span><span>Liability cap</span><b>Verified</b></div>
              <div className="evidence-row"><span>Schedule B</span><span>Renewal notice</span><b>Review</b></div>
            </TiltCard>
            <div className="section-intro">
              <div className="eyebrow"><Bot size={13} /> Intelligence without the black box</div>
              <h2>AI that shows its work.</h2>
              <p>CovenX helps teams move faster without surrendering judgment. Every summary, extracted term, risk, and answer is grounded in tenant-scoped evidence and routed through human review.</p>
              <button className="landing-outline" onClick={onEnter}>
                <span>See the intelligence workspace</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </Reveal>

        {/* Security Section */}
        <Reveal direction="up" delay={70}>
          <section className="landing-section security-section" id="security">
            <div className="security-badge"><ShieldCheck size={26} /></div>
            <div className="section-intro">
              <div className="eyebrow"><LockKeyhole size={13} /> Enterprise trust, operationalized</div>
              <h2>Security is part of the workflow.</h2>
              <p>Role-based access, audit trails, secure document management, data isolation, and governed lifecycle controls are built into the CovenX operating model.</p>
              <div className="security-pills">
                <span><ShieldCheck size={12} /> RBAC</span>
                <span><LockKeyhole size={12} /> Audit-ready</span>
                <span><CheckCircle2 size={12} /> Tenant isolated</span>
                <span><Workflow size={12} /> Lifecycle governed</span>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="landing-footer-container">
        <Reveal direction="up" delay={40}>
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
        </Reveal>

        <div className="landing-footer-main">
          <div className="footer-brand-col">
            <button
              className="brand-button landing-footer-brand"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="CovenX home"
            >
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
              <li><button className="footer-link-btn" onClick={() => scrollTo('platform')}>Contract Lifecycle</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('intelligence')}>AI Risk Extraction</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Enterprise Approvals</button></li>
              <li><button className="footer-link-btn" onClick={onRegister}>Obligation Manager</button></li>
              <li><button className="footer-link-btn" onClick={onRegister}>Clause Intelligence</button></li>
              <li><button className="footer-link-btn" onClick={onRegister}>Renewal Pipeline</button></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Security & Trust</h4>
            <ul>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Tenant Isolation</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Role-Based Access (RBAC)</button></li>
              <li><button className="footer-link-btn" onClick={onEnter}>Audit History</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Malware File Scanning</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Data Encryption at Rest</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('security')}>Compliance Posture</button></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Company</h4>
            <ul>
              <li><button className="footer-link-btn" onClick={() => scrollTo('platform')}>About CovenX</button></li>
              <li><button className="footer-link-btn" onClick={onRegister}>Guided 14-day Trial</button></li>
              <li><button className="footer-link-btn" onClick={onEnter}>Workspace Portal</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('platform')}>Privacy Policy</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('platform')}>Terms of Service</button></li>
              <li><button className="footer-link-btn" onClick={() => scrollTo('intelligence')}>Responsible AI</button></li>
            </ul>
          </div>

          <div className="footer-contact-col">
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
      <HelpdeskChatbot />
    </div>
  );
}
