import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyWebhookSignature, parseWebhook } from '@/lib/billing';

/**
 * POST /api/webhooks/billing — Lemon Squeezy webhook (workstream B).
 * Verifies the HMAC signature, then flips the user's premium flag. Idempotent:
 * grant/revoke set absolute state, so retries/replays are safe. Always 200s once
 * the signature is valid (even if the user can't be resolved) to stop retries.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const evt = parseWebhook(payload);
  if (evt.type === 'ignore') {
    return NextResponse.json({ received: true, ignored: true });
  }

  // Resolve the user by the custom user_id, falling back to the billing customer id.
  let user = evt.userId
    ? await prisma.user.findUnique({ where: { id: evt.userId } })
    : null;
  if (!user && evt.customerId) {
    user = await prisma.user.findFirst({ where: { billingCustomerId: evt.customerId } });
  }
  if (!user) {
    console.warn('Billing webhook: could not resolve user', { userId: evt.userId, customerId: evt.customerId });
    return NextResponse.json({ received: true, note: 'user not found' });
  }

  if (evt.type === 'grant') {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: true,
        premiumUntil: evt.premiumUntil ?? null,
        premiumPlan: evt.plan ?? null,
        billingCustomerId: evt.customerId ?? user.billingCustomerId,
      },
    });
  } else if (evt.type === 'revoke') {
    await prisma.user.update({
      where: { id: user.id },
      data: { isPremium: false },
    });
  }

  return NextResponse.json({ received: true });
}
