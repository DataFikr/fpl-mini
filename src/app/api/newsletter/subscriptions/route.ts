import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const subscriptions = await prisma.newsletterSubscription.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        email: sub.email,
        leagueId: sub.leagueId,
        createdAt: sub.createdAt,
        lastSentAt: sub.lastSentAt
      }))
    });

  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}