'use client';

import { useEffect, useState } from 'react';

/** Fire a toast from anywhere in the /app tree. */
export function toast(msg: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fpl-toast', { detail: msg }));
  }
}

export function ToastHost() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const handler = (e: Event) => {
      setMsg((e as CustomEvent).detail as string);
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 1600);
    };
    window.addEventListener('fpl-toast', handler);
    return () => { window.removeEventListener('fpl-toast', handler); clearTimeout(t); };
  }, []);

  return (
    <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      <span>{msg}</span>
    </div>
  );
}
