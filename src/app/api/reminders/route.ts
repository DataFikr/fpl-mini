import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { signTeamToken, verifyTeamToken } from '@/lib/newsletter-token';
import { EmailService } from '@/services/email-service';
import { SITE_URL } from '@/lib/seo';

/**
 * Squad deadline reminders — opt-in and opt-out.
 *
 * The deadline reminder is the highest-scoring painkiller the product ships
 * (recurring, deadline-coupled, loss-framed), and until now it could only reach
 * people who had joined a *mini-league newsletter*: 16 addresses. Anyone who has
 * entered a team ID has already demonstrated the exact intent it serves, so this
 * decouples the reminder from the league newsletter entirely.
 *
 * Single opt-in, matching /api/newsletter/subscribe — a row is a live
 * subscriber the moment it is written. Every send carries a one-click
 * unsubscribe built from the same signed token.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST { email, teamId } — subscribe this address to its squad's deadline reminder. */
export async function POST(request: NextRequest) {
  try {
    const { email, teamId } = await request.json();

    if (!email || !EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const fplTeamId = parseInt(String(teamId), 10);
    if (!Number.isFinite(fplTeamId) || fplTeamId <= 0) {
      return NextResponse.json({ error: 'A valid FPL team ID is required.' }, { status: 400 });
    }

    const normalized = String(email).toLowerCase();

    // Email is unique: re-subscribing with a different team repoints the
    // reminder rather than erroring, which is what someone switching teams
    // means by submitting the form again.
    const sub = await prisma.deadlineSubscription.upsert({
      where: { email: normalized },
      update: { fplTeamId, isActive: true },
      create: { email: normalized, fplTeamId, isActive: true },
    });

    const base = (process.env.NEXT_PUBLIC_BASE_URL || SITE_URL).replace(/\/$/, '');
    const unsubscribeUrl = `${base}/api/reminders?token=${signTeamToken(normalized, fplTeamId)}`;

    // Best-effort: a failed welcome must not fail the subscription itself.
    try {
      await EmailService.getInstance().sendDeadlineOptInWelcome({
        to: normalized,
        fplTeamId,
        unsubscribeUrl,
      });
    } catch (e) {
      console.warn('Deadline opt-in welcome failed (continuing):', e);
    }

    return NextResponse.json({
      success: true,
      id: sub.id,
      message: "You're in — your reminder lands before the next deadline.",
    });
  } catch (error) {
    console.error('Deadline reminder subscribe error:', error);

    // The table ships in the same release as this route, so between deploy and
    // `npm run db:push` it will not exist yet. Say so plainly instead of a bare
    // 500 — the same treatment /api/newsletter/subscribe already gives it.
    const msg = error instanceof Error ? error.message.toLowerCase() : '';
    const missingTable =
      (error as { code?: string })?.code === 'P2021' ||
      (msg.includes('does not exist') && (msg.includes('relation') || msg.includes('table')));
    if (missingTable) {
      return NextResponse.json(
        { error: 'Reminders are not switched on yet — try again shortly.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Could not save that. Please try again.' }, { status: 500 });
  }
}

/** GET ?token=… — one-click unsubscribe, linked from every reminder. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const parsed = verifyTeamToken(token);

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
    return page('Link not valid', 'That unsubscribe link didn’t work. You can turn reminders off from your squad page instead.', false);
  }

  try {
    // Deactivate rather than delete, so a re-subscribe keeps the original
    // consent date and this stays idempotent across repeated clicks.
    await prisma.deadlineSubscription.updateMany({
      where: { email: parsed.email.toLowerCase() },
      data: { isActive: false },
    });
    return page('Reminders off', 'You won’t get any more deadline reminders. Your squad and mini-leagues are unaffected.', true);
  } catch {
    return page('Something went wrong', 'We couldn’t update that right now. Please try the link again shortly.', false);
  }
}
