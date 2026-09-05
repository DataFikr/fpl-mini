'use client';

import { FREE_WINDOW_LABEL } from '@/lib/premium';

/**
 * Wraps unlocked premium content so it still reads as premium.
 *
 * `on` is false for genuine paying users — they have already bought, so the
 * frame would only be noise, and this renders their content untouched. It is
 * true only during the launch free window, where the content is free but the
 * user needs to learn that it is premium and what it will cost, before the
 * window closes and it disappears.
 */
export function PremiumFrame({ on, blurb, onGo, children }: {
  on: boolean; blurb: string; onGo: () => void; children: React.ReactNode;
}) {
  if (!on) return <>{children}</>;
  return (
    <div className="prem-preview">
      <div className="prem-preview-bar">
        <span className="pp-tag">Premium · {FREE_WINDOW_LABEL}</span>
        <span className="pp-note">£15 after</span>
      </div>
      {children}
      <div className="prem-preview-foot">
        <p>{blurb} This is a premium feature, unlocked for everyone during launch.</p>
        <button className="s-btn s-btn--ghost hex" onClick={onGo}>What&rsquo;s in premium</button>
      </div>
    </div>
  );
}
