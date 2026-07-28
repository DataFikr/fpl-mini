import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifySubToken } from '@/lib/newsletter-token';
import { SITE_URL } from '@/lib/seo';

/**
 * Double opt-in confirmation (I5). The link in the "confirm your subscription"
 * email points here; a valid token flips `verifiedAt` so bulk sends will include
 * the subscriber. Returns a small branded HTML page.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const parsed = verifySubToken(token);

  const page = (title: string, body: string, ok: boolean) =>
    new NextResponse(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · FPL Ranker</title>
<style>body{margin:0;background:#FAFAFA;color:#150000;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px}
.card{max-width:420px;background:#fff;border:1px solid #D6D5D5;padding:32px 28px;text-align:center;box-shadow:0 12px 34px -14px rgba(21,0,0,.28)}
h1{font-size:24px;margin:0 0 8px;color:${ok ? '#009C54' : '#FF5050'}}p{color:#5B5757;line-height:1.6;font-size:15px;margin:0 0 18px}
a{display:inline-block;background:#FF5050;color:#fff;font-weight:700;text-decoration:none;padding:12px 22px}</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p><a href="${SITE_URL}/app">Open FPL Ranker</a></div></body></html>`,
      { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );

  if (!parsed) {
    return page('Link expired or invalid', 'That confirmation link didn’t work. Re-subscribe from your league page to get a fresh one.', false);
  }

  try {
    const sub = await prisma.newsletterSubscription.findUnique({
      where: { email_leagueId: { email: parsed.email.toLowerCase(), leagueId: parsed.leagueId } },
    });
    if (!sub) {
      return page('Subscription not found', 'We couldn’t find that subscription. Try subscribing again from your league page.', false);
    }
    await prisma.newsletterSubscription.update({
      where: { id: sub.id },
      data: { verifiedAt: new Date(), isActive: true },
    });
    return page('You’re confirmed! ✓', 'Your email is verified — you’ll get your mini-league’s gameweek recaps and deadline reminders.', true);
  } catch {
    return page('Something went wrong', 'We couldn’t confirm your subscription right now. Please try the link again shortly.', false);
  }
}
