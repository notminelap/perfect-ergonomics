import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let mx = -100, my = -100, rx = -100, ry = -100;
    let rafId, visible = false;

    const show = () => {
      if (!visible) {
        visible = true;
        if (dotRef.current)  dotRef.current.style.opacity  = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + 'px';
        dotRef.current.style.top  = my + 'px';
      }
      show();
    };

    const loop = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px';
        ringRef.current.style.top  = ry + 'px';
      }
      rafId = requestAnimationFrame(loop);
    };

    const expand = () => {
      if (ringRef.current) { ringRef.current.style.transform = 'translate(-50%,-50%) scale(2.2)'; ringRef.current.style.opacity = '0.5'; }
      if (dotRef.current)  dotRef.current.style.transform = 'translate(-50%,-50%) scale(0.4)';
    };
    const reset = () => {
      if (ringRef.current) { ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)'; ringRef.current.style.opacity = '1'; }
      if (dotRef.current)  dotRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
    };

    const addHovers = () => {
      document.querySelectorAll('button, a, [role="button"], input, select, textarea').forEach(el => {
        el.addEventListener('mouseenter', expand);
        el.addEventListener('mouseleave', reset);
      });
    };

    window.addEventListener('mousemove', move);
    loop();
    addHovers();
    const observer = new MutationObserver(addHovers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const base = {
    position: 'fixed', zIndex: 99999, pointerEvents: 'none',
    borderRadius: '50%', transform: 'translate(-50%,-50%)',
    opacity: 0, transition: 'transform 0.25s ease, opacity 0.3s ease',
  };

  return (
    <>
      <div ref={dotRef} style={{ ...base, width: 8, height: 8, background: 'rgba(255,255,255,0.95)', mixBlendMode: 'difference' }} />
      <div ref={ringRef} style={{ ...base, width: 38, height: 38, border: '1.5px solid rgba(255,255,255,0.5)', transition: 'transform 0.3s ease, opacity 0.3s ease' }} />
    </>
  );
}
