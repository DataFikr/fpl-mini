'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';
import { extractTeamId } from '@/lib/team-id';

/**
 * Direct team-ID entry, for wherever someone already has the number in hand.
 *
 * Exists mainly so the find-your-team-ID guide can be acted on where it is
 * read: it previously ended by sending people back to /app to paste the ID,
 * which loses them at the exact moment they finally have it.
 *
 * Accepts a pasted FPL URL as well as a bare id — following the guide leaves
 * `fantasy.premierleague.com/entry/<id>/…` in the clipboard.
 */
export function TeamIdEntry({ label = 'Rank it' }: { label?: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractTeamId(value);
    if (!id) { toast('Enter your team ID, or paste your FPL team link'); return; }
    router.push(`/app/home?teamId=${id}`);
  };

  return (
    <form id="team-id-entry" name="team-id-entry" className="mgr-search" onSubmit={go} noValidate>
      <div className="id-field">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 6454003, or paste your FPL link"
          aria-label="Your FPL team ID"
          autoComplete="off"
        />
        <button type="submit" className="s-btn s-btn--red hex">{label}</button>
      </div>
    </form>
  );
}
