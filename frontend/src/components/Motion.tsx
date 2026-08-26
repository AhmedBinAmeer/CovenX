import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

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
  return <div key={routeKey} className="page-transition" data-route={routeKey}>{children}</div>;
}

export function Reveal({ children, className = '', direction = 'up', delay = 0 }: { children: ReactNode; className?: string; direction?: 'up' | 'down' | 'left' | 'right' | 'scale'; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) { setVisible(true); return; }
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return <div ref={ref} className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`} style={{ ['--reveal-delay' as string]: `${reduced ? 0 : delay}ms` }}>{children}</div>;
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let x = -100;
    let y = -100;
    const render = () => {
      node.style.setProperty('--cursor-x', `${x}px`);
      node.style.setProperty('--cursor-y', `${y}px`);
      node.classList.add('is-active');
      frame = 0;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onLeave = () => node.classList.remove('is-active');
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

export function ParallaxLayer({ children, className = '', depth = 0.05, ...props }: { children: ReactNode; className?: string; depth?: number } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      node.style.setProperty('--parallax-x', `${x}px`);
      node.style.setProperty('--parallax-y', `${y}px`);
      frame = 0;
    };
    const onMove = (event: PointerEvent) => {
      x = (event.clientX - window.innerWidth / 2) * depth;
      y = (event.clientY - window.innerHeight / 2) * depth;
      if (!frame) frame = requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [depth, reduced]);

  return <div ref={ref} className={`parallax-layer ${className}`} {...props}>{children}</div>;
}

export function TiltCard({ children, className = '', maxTilt = 4, disabled = false }: { children: ReactNode; className?: string; maxTilt?: number; disabled?: boolean }) {
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

  return <div ref={ref} className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</div>;
}

export function useAnimatedNumber(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
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
