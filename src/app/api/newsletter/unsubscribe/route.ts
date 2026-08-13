import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifySubToken } from '@/lib/newsletter-token';
import { SITE_URL } from '@/lib/seo';

/**
 * One-click unsubscribe.
 *
 * Every marketing email must carry a working opt-out, and a broken one is a
 * deliverability and compliance problem — so this reuses the same HMAC token as
 * the double opt-in flow rather than taking a raw email in the query string,
 * which would let anyone unsubscribe anyone.
 *
 * Sets `isActive: false` rather than deleting, so a re-subscribe restores the
 * row (and its verified state) instead of starting the opt-in over.
 */
function page(title: string, body: string, ok: boolean) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · FPL Ranker</title>
<style>body{margin:0;background:#FAFAFA;color:#150000;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px}
.card{max-width:420px;background:#fff;border:1px solid #D6D5D5;padding:32px 28px;text-align:center;box-shadow:0 12px 34px -14px rgba(21,0,0,.28)}
h1{font-size:24px;margin:0 0 8px;color:${ok ? '#150000' : '#FF5050'}}p{color:#5B5757;line-height:1.6;font-size:15px;margin:0 0 18px}
a{display:inline-block;background:#FF5050;color:#fff;font-weight:700;text-decoration:none;padding:12px 22px}</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p><a href="${SITE_URL}/app">Back to FPL Ranker</a></div></body></html>`,
    { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

async function unsubscribe(token: string) {
  const parsed = verifySubToken(token);
  if (!parsed) {
    return page('Link invalid', 'That unsubscribe link didn’t work. Reply to any of our emails and we’ll remove you by hand.', false);
  }
  try {
    const sub = await prisma.newsletterSubscription.findUnique({
      where: { email_leagueId: { email: parsed.email.toLowerCase(), leagueId: parsed.leagueId } },
    });
    // Already gone is a success from the reader's point of view.
    if (!sub) return page('You’re unsubscribed', 'That address isn’t on our list — nothing further will be sent.', true);

    await prisma.newsletterSubscription.update({ where: { id: sub.id }, data: { isActive: false } });
    return page('You’re unsubscribed', 'You won’t receive any more gameweek emails for this league. You can re-subscribe any time from your league page.', true);
  } catch {
    return page('Something went wrong', 'We couldn’t process that right now. Please try the link again shortly.', false);
  }
}

export async function GET(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token') || '');
}

/**
 * RFC 8058 one-click unsubscribe: Gmail and Yahoo POST here when the reader uses
 * the mail client's own unsubscribe button, and require a 2xx.
 */
export async function POST(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token') || '');
}
