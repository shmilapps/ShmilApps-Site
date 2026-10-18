'use client';

import { useEffect, useRef, useState } from 'react';

export default function TrainingExampleBook({ language }: { language: 'he' | 'en' }) {
  const wrapper = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(680);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const details = wrapper.current?.closest('details');
    if (!details) return;
    const activate = () => { if (details.open) setActive(true); };
    activate();
    details.addEventListener('toggle', activate);
    return () => details.removeEventListener('toggle', activate);
  }, []);

  useEffect(() => {
    const resize = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type !== 'shmilapps-training-book-height') return;
      const value = event.data.height;
      if (typeof value === 'number' && Number.isFinite(value) && value >= 100 && value <= 1000) setHeight(Math.ceil(value));
    };
    window.addEventListener('message', resize);
    return () => window.removeEventListener('message', resize);
  }, []);

  return <figure ref={wrapper} className="market-research-book">
    {active ? <iframe
      ref={frame}
      src={'/portfolio/training/crypto-book/index.html?lang=' + language}
      title={language === 'he' ? 'קריפטו וביטקוין - ספר הדרכה לדוגמה בעברית' : 'Crypto and Bitcoin - sample training book in English'}
      style={{ height }}
    /> : null}
  </figure>;
}
