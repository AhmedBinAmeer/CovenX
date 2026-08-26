import { useEffect, useRef, useState, type ReactNode } from 'react';

export function AnimatedPage({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  return <div key={routeKey} className="page-transition" data-route={routeKey}>{children}</div>;
}

export function Reveal({ children, className = '', direction = 'up', delay = 0 }: { children: ReactNode; className?: string; direction?: 'up' | 'down' | 'left' | 'right' | 'scale'; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [visible, setVisible] = useState(false);
  useEffect(() => { const node = ref.current; if (!node) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.08 }); observer.observe(node); return () => observer.disconnect(); }, []);
  return <div ref={ref} className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`} style={{ ['--reveal-delay' as string]: `${delay}ms` }}>{children}</div>;
}

export function useAnimatedNumber(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  useEffect(() => { const start = performance.now(); const initial = display; let frame = 0; const tick = (now: number) => { const progress = Math.min(1, (now - start) / duration); const eased = 1 - Math.pow(1 - progress, 3); setDisplay(Math.round(initial + (value - initial) * eased)); if (progress < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value, duration]);
  return display;
}
