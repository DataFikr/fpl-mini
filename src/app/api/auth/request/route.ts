import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email-service';
import { createLoginToken, isValidEmail, normalizeEmail } from '@/lib/auth';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

/**
 * POST /api/auth/request  { email }
 * Emails a single-use magic link. Always returns success (does not reveal
 * whether an account exists) as long as the email is syntactically valid.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, next } = await request.json();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const raw = await createLoginToken(email);
    const base = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
    // Only carry a same-site relative path forward, to avoid open-redirects.
    const safeNext = typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : '';
    const nextParam = safeNext ? `&next=${encodeURIComponent(safeNext)}` : '';
    const link = `${base.replace(/\/$/, '')}/api/auth/verify?token=${raw}${nextParam}`;

    const html = magicLinkEmail(link);
    await EmailService.getInstance().sendEmail({
      to: normalizeEmail(email),
      subject: `Sign in to ${SITE_NAME}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth request error:', error);
    // Still return success shape to avoid leaking internal state to clients.
    return NextResponse.json({ success: true });
  }
}

function magicLinkEmail(link: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 8px">Sign in to ${SITE_NAME}</h1>
    <p style="color:#444;font-size:14px;line-height:1.5">
      Click the button below to sign in. This link works once and expires in 15 minutes.
      If you didn't request it, you can safely ignore this email.
    </p>
    <p style="margin:24px 0">
      <a href="${link}"
         style="background:#2B1654;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">
        Sign in
      </a>
    </p>
    <p style="color:#888;font-size:12px;word-break:break-all">
      Or paste this link into your browser:<br>${link}
    </p>
  </div>`;
}
