#!/usr/bin/env node
/**
 * One-off: adopt the subscribers stranded by double opt-in.
 *
 * Under the old flow a subscribe wrote `verifiedAt: null` and waited for a click
 * in a confirmation email. Only 1 of 5 ever clicked, so the rest sit in the
 * database having explicitly asked for the newsletter and never receiving one —
 * bulk sends and both cron jobs filter on `verifiedAt: { not: null }`.
 *
 * Subscribing is now single opt-in, so those rows would be verified had they
 * arrived a day later. This stamps them so they start receiving what they asked
 * for. It only touches rows that are still `isActive` — anyone who unsubscribed
 * stays out.
 *
 * Dry by default; pass --apply to write.
 *
 *   node scripts/backfill-newsletter-optin.mjs           # preview
 *   node scripts/backfill-newsletter-optin.mjs --apply   # write
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

const main = async () => {
  const pending = await prisma.newsletterSubscription.findMany({
    where: { isActive: true, verifiedAt: null },
    select: { id: true, email: true, leagueId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!pending.length) {
    console.log('Nothing to backfill — no active unverified subscriptions.');
    return;
  }

  console.log(`${pending.length} active subscription(s) never confirmed:\n`);
  for (const s of pending) {
    console.log(`  ${s.email.padEnd(34)} league ${String(s.leagueId).padEnd(9)} asked ${s.createdAt.toISOString().slice(0, 10)}`);
  }

  if (!apply) {
    console.log(`\nDry run. Re-run with --apply to stamp verifiedAt on these ${pending.length} row(s).`);
    return;
  }

  // verifiedAt is set to the original signup time, not now: it records when the
  // person actually consented, which is what a compliance question would ask.
  let done = 0;
  for (const s of pending) {
    await prisma.newsletterSubscription.update({
      where: { id: s.id },
      data: { verifiedAt: s.createdAt },
    });
    done++;
  }
  console.log(`\nBackfilled ${done} subscription(s). They receive the next scheduled send.`);
};

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
