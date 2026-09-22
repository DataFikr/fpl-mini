/**
 * Cron outcome vocabulary — the difference between "nothing to do" and "nothing happened".
 *
 * The daily dispatcher used to answer `success: true` whatever the jobs did, so
 * a summary job that mailed nobody looked exactly like one that mailed everybody.
 * The 21 Sep revenue diagnostic found the gameweek emails had been dead since
 * 3 Sep — nineteen days — without one failed request to show for it.
 *
 *   idle    — a gate is legitimately shut (outside the send window, already sent
 *             for this gameweek, season over). Healthy; most days are idle.
 *   sent    — mail went out.
 *   stalled — the window was OPEN and the job still mailed nobody. Recipients
 *             filtered to zero, Resend unconfigured, every league lookup failing.
 *             This is the state that ran silently. Always a bug.
 *   error   — the job threw.
 *
 * `stalled` and `error` make the dispatcher answer 5xx, so the platform's own
 * cron log shows a failure instead of a green tick. That is the whole point:
 * the failure has to be visible somewhere nobody has to remember to look.
 */
export type CronOutcome = 'sent' | 'idle' | 'stalled' | 'error';

export interface CronJobReport {
  outcome: CronOutcome;
  message: string;
  sent?: number;
  failed?: number;
  /**
   * Every gate the job evaluated, so a zero-send day can be diagnosed from one
   * request instead of by reading the source and guessing which branch ran.
   */
  gates?: Record<string, unknown>;
}

/** Did this job fail, as opposed to correctly deciding there was nothing to do? */
export function isUnhealthy(report: CronJobReport): boolean {
  return report.outcome === 'stalled' || report.outcome === 'error';
}

/**
 * Classify the result of a batch send whose window was already open.
 *
 * Zero delivered mail from an open window is `stalled` even when nothing threw —
 * `EmailService.sendBatch` resolves with `successCount: 0` when `RESEND_API_KEY`
 * is missing, which is precisely the kind of quiet nothing this vocabulary exists
 * to catch.
 */
export function classifySend(sent: number, failed: number, context: string): CronJobReport {
  if (sent > 0) {
    return {
      outcome: 'sent',
      message: `${context}: ${sent} sent${failed ? `, ${failed} failed` : ''}`,
      sent,
      failed,
    };
  }
  return {
    outcome: 'stalled',
    message: `${context}: the send window was open and nothing was delivered${
      failed ? ` (${failed} failed)` : ''
    }`,
    sent: 0,
    failed,
  };
}

/** A gate is shut for a good reason — the common, healthy case. */
export function idle(message: string, gates?: Record<string, unknown>): CronJobReport {
  return { outcome: 'idle', message, sent: 0, gates };
}

/** The window was open but there was nobody eligible to mail. */
export function stalled(message: string, gates?: Record<string, unknown>): CronJobReport {
  return { outcome: 'stalled', message, sent: 0, gates };
}
