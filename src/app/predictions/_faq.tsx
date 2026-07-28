'use client';

import { useState } from 'react';

/** Accordion FAQ (mockup 03). Structured data is emitted separately server-side. */
export function PredictionsFaq({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.question} className={`faq-item${isOpen ? ' open' : ''}`}>
            <button
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              {f.question}
              <span className="ic" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="faq-a">{f.answer}</p>}
          </div>
        );
      })}
    </>
  );
}
