import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ShieldCheck, Sparkles, LockKeyhole } from 'lucide-react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export function AnimatedPage({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  return (
    <div key={routeKey} className="page-transition page-entrance-stagger" data-route={routeKey}>
      {children}
    </div>
  );
}

export function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) {
      setVisible(true);
      return;
    }
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ['--reveal-delay' as string]: `${reduced ? 0 : delay}ms` }}
    >
      {children}
    </div>
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHovering = false;

    const render = () => {
      // Smooth lerp for silky trailing effect
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      node.style.setProperty('--cursor-x', `${currentX.toFixed(1)}px`);
      node.style.setProperty('--cursor-y', `${currentY.toFixed(1)}px`);
      node.classList.add('is-active');

      if (isHovering) {
        node.classList.add('is-hovering');
      } else {
        node.classList.remove('is-hovering');
      }

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      // Check if hovering over interactive elements
      const target = event.target as HTMLElement | null;
      isHovering = !!target?.closest('button, a, input, select, textarea, [role="button"], .card, .tilt-card, .nav-item, .clickable');

      if (!frame) frame = requestAnimationFrame(render);
    };

    const onLeave = () => {
      node.classList.remove('is-active');
      node.classList.remove('is-hovering');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <div ref={ref} className="cursor-glow-system" aria-hidden="true">
      <div className="cursor-dot" />
      <div className="cursor-glow" />
    </div>
  );
}

export function ParallaxLayer({
  children,
  className = '',
  depth = 0.05,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  depth?: number;
} & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      node.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
      node.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX - window.innerWidth / 2) * depth;
      targetY = (event.clientY - window.innerHeight / 2) * depth;
      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [depth, reduced]);

  return (
    <div ref={ref} className={`parallax-layer ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const active = !disabled && !reduced;

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--tilt-x', '0deg');
    node.style.setProperty('--tilt-y', '0deg');
    node.style.setProperty('--tilt-glow-x', '50%');
    node.style.setProperty('--tilt-glow-y', '50%');
    node.classList.remove('is-tilting');
  };

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const percentX = (event.clientX - bounds.left) / bounds.width;
    const percentY = (event.clientY - bounds.top) / bounds.height;
    const tiltX = (0.5 - percentY) * maxTilt;
    const tiltY = (percentX - 0.5) * maxTilt;
    node.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
    node.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    node.style.setProperty('--tilt-glow-x', `${(percentX * 100).toFixed(1)}%`);
    node.style.setProperty('--tilt-glow-y', `${(percentY * 100).toFixed(1)}%`);
    node.classList.add('is-tilting');
  };

  return (
    <div ref={ref} className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </div>
  );
}

export function SmoothLoadingScreen({
  message = 'Preparing your enterprise workspace...',
  onComplete,
}: {
  message?: string;
  onComplete?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing secure environment');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const stages = [
      { at: 20, label: 'Verifying security perimeter' },
      { at: 50, label: 'Loading tenant RBAC policies & keys' },
      { at: 80, label: 'Establishing real-time audit boundary' },
      { at: 100, label: 'Ready' },
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(Math.min(100, currentProgress));
      for (let i = stages.length - 1; i >= 0; i--) {
        if (currentProgress >= stages[i].at) {
          setStage(stages[i].label);
          break;
        }
      }
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => onComplete?.(), 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${isExiting ? 'is-exiting' : ''}`} role="status" aria-live="polite">
      <div className="loading-bg-glow" />
      <div className="loading-center-cluster">
        <div className="loading-brand-icon">
          <div className="loading-pulse-ring" />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3ee09a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>

        <div className="loading-copy-block">
          <div className="loading-brand-header">
            <strong>CovenX</strong>
            <span>Enterprise Contract Lifecycle Management</span>
          </div>

          <div className="loading-status-line">
            <span className="loading-spinner-dot" />
            <span className="loading-stage-text">{stage}...</span>
          </div>

          <div className="loading-progress-track">
            <div className="loading-progress-bar" style={{ width: `${progress}%` }}>
              <div className="loading-progress-glow" />
            </div>
          </div>

          <div className="loading-meta-pills">
            <span><ShieldCheck size={12} /> Tenant Isolated</span>
            <span><LockKeyhole size={12} /> 256-bit Encrypted</span>
            <span><Sparkles size={12} /> AI Governed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAnimatedNumber(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const initial = display;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(initial + (value - initial) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);
  return display;
}

export function motionStyle(delay = 0): CSSProperties {
  return { ['--motion-delay' as string]: `${delay}ms` };
}
