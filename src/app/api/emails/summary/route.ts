import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get quick summary of all emails
    const [totalEmails, activeEmails, leagueBreakdown, recentEmails] = await Promise.all([
      // Total count
      prisma.newsletterSubscription.count(),

      // Active count
      prisma.newsletterSubscription.count({
        where: { isActive: true }
      }),

      // League breakdown
      prisma.newsletterSubscription.groupBy({
        by: ['leagueId'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } }
      }),

      // Recent subscriptions
      prisma.newsletterSubscription.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          leagueId: true,
          isActive: true,
          createdAt: true,
          lastSentAt: true
        }
      })
    ]);

    // Get all emails (for quick export)
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    let allEmails = [];
    if (includeAll) {
      allEmails = await prisma.newsletterSubscription.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          leagueId: true,
          isActive: true,
          createdAt: true,
          lastSentAt: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEmails,
          activeEmails,
          inactiveEmails: totalEmails - activeEmails,
          totalLeagues: leagueBreakdown.length
        },
        leagueBreakdown,
        recentEmails,
        ...(includeAll && { allEmails })
      }
    });

  } catch (error) {
    console.error('Email summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email summary' },
      { status: 500 }
    );
  }
}