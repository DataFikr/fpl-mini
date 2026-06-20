'use client';

import { useState } from 'react';
import { FaXTwitter, FaReddit } from 'react-icons/fa6';
import { toast } from './Toast';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success || data.isDemo) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSent(false), 4000);
      } else {
        toast(data.message || 'Failed to send — try again');
      }
    } catch {
      toast('Failed to send — try again later');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-cols">
      {/* info */}
      <div>
        <h2 style={{ marginTop: 0 }}>Get in touch</h2>
        <div className="info-card"><h3>Email</h3><p><a href="mailto:support@fplranker.com">support@fplranker.com</a></p></div>
        <div className="info-card"><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaXTwitter /> X (Twitter)</h3><p><a href="https://x.com/fplranker" target="_blank" rel="noopener noreferrer">@FPLRanker</a></p></div>
        <div className="info-card"><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaReddit /> Reddit</h3><p><a href="https://www.reddit.com/user/fplranker/" target="_blank" rel="noopener noreferrer">u/fplranker</a></p></div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 8 }}>We aim to respond within 48 hours</p>
      </div>

      {/* form */}
      <div>
        <h2 style={{ marginTop: 0 }}>Send a message</h2>
        {sent ? (
          <div className="callout" style={{ textAlign: 'left' }}>
            <div className="lbl">Sent</div>
            <h2>MESSAGE SENT!</h2>
            <p style={{ margin: 0 }}>Thanks for reaching out — we&rsquo;ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="form-field"><label htmlFor="name">Name</label><input id="name" name="name" value={form.name} onChange={onChange} required placeholder="Your full name" /></div>
            <div className="form-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="you@example.com" /></div>
            <div className="form-field"><label htmlFor="message">Message</label><textarea id="message" name="message" value={form.message} onChange={onChange} required placeholder="Your question, suggestion or how we can help…" /></div>
            <button type="submit" className="s-btn s-btn--red hex" disabled={sending} style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.6 : 1 }}>
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
