#!/usr/bin/env node
/**
 * One-off backfill: stamp `verifiedAt` on newsletter rows that predate single opt-in.
 *
 * Both gameweek cron jobs select recipients with
 * `{ isActive: true, verifiedAt: { not: null } }`. That filter was written for
 * double opt-in, where `verifiedAt` was set by a click in a confirmation email.
 * Single opt-in replaced it on 5 Sep 2026 — `/api/newsletter/subscribe` now
 * stamps `verifiedAt` at submit time, and `/api/newsletter/verify` says in its
 * own header that nothing routes there any more.
 *
 * So every row created before the cutover kept a null that nothing can ever
 * clear, and the cron has been skipping them. At the 21 Sep 2026 diagnostic that
 * was 29 of 32 active subscriptions — 91% of the list, silently unreachable.
 *
 * These are not cold addresses: each one submitted the subscribe form. Under
 * single opt-in that submission is the consent. What they never did is click a
 * confirmation link that no longer gets sent.
 *
 *   node scripts/backfill-newsletter-verified.mjs            # dry run (default)
 *   node scripts/backfill-newsletter-verified.mjs --commit   # write
 *
 * Dry run is the default on purpose: this decides who receives email.
 */

import { PrismaClient } from '@prisma/client';

const commit = process.argv.includes('--commit');
const prisma = new PrismaClient();

/** Mask an address enough to eyeball the list without printing it in full. */
function mask(email) {
  const [user = '', domain = ''] = email.split('@');
  const head = user.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

async function main() {
  const [active, alreadyVerified, pending] = await Promise.all([
    prisma.newsletterSubscription.count({ where: { isActive: true } }),
    prisma.newsletterSubscription.count({ where: { isActive: true, verifiedAt: { not: null } } }),
    prisma.newsletterSubscription.findMany({
      where: { isActive: true, verifiedAt: null },
      select: { id: true, email: true, createdAt: true, lastSentAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  console.log('\nNewsletter verifiedAt backfill');
  console.log('─'.repeat(64));
  console.log(`  ${String(active).padStart(4)} active subscriptions`);
  console.log(`  ${String(alreadyVerified).padStart(4)} already verified (reachable by the cron today)`);
  console.log(`  ${String(pending.length).padStart(4)} would be stamped verifiedAt = now`);

  if (!pending.length) {
    console.log('\nNothing to do — every active subscription is already verified.\n');
    return;
  }

  const oldest = pending[0];
  const newest = pending[pending.length - 1];
  const neverMailed = pending.filter((s) => !s.lastSentAt).length;
  console.log(`       oldest created ${oldest.createdAt.toISOString().slice(0, 10)}`);
  console.log(`       newest created ${newest.createdAt.toISOString().slice(0, 10)}`);
  console.log(`       ${neverMailed} have never been mailed`);

  console.log('\n  Addresses:');
  for (const s of pending) {
    const last = s.lastSentAt ? s.lastSentAt.toISOString().slice(0, 10) : 'never mailed';
    console.log(`    ${mask(s.email).padEnd(34)} created ${s.createdAt.toISOString().slice(0, 10)} · ${last}`);
  }

  if (!commit) {
    console.log('\n  DRY RUN — nothing written. Re-run with --commit to apply.');
    console.log('  Expect bounces on the first send: some of these are ~12 months stale,');
    console.log('  so watch the Resend bounce rate and deactivate hard bounces.\n');
    return;
  }

  const now = new Date();
  const { count } = await prisma.newsletterSubscription.updateMany({
    where: { isActive: true, verifiedAt: null },
    data: { verifiedAt: now },
  });

  console.log(`\n  ✓ ${count} rows stamped verifiedAt = ${now.toISOString()}`);
  console.log(`  Cron recipient list: ${alreadyVerified} → ${alreadyVerified + count}\n`);
}

main()
  .catch((e) => {
    console.error('\n  ✗ Backfill failed:', e instanceof Error ? e.message : e, '\n');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
