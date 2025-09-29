import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { FPLApiService } from '@/services/fpl-api';
import { EmailService } from '@/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { leagueId, gameweek, stories } = await request.json();

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Get current gameweek if not provided
    let currentGameweek = gameweek;
    if (!currentGameweek) {
      try {
        const fplApi = new FPLApiService();
        currentGameweek = await fplApi.getCurrentGameweek();
      } catch (error) {
        console.warn('Failed to fetch current gameweek, using fallback:', error);
        currentGameweek = 6; // Fallback
      }
    }

    // Get all active subscribers for this league
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        leagueId: parseInt(leagueId),
        isActive: true
      }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers found for this league',
        sentCount: 0
      });
    }

    const emailService = EmailService.getInstance();
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Get league name from FPL API or use fallback
    let leagueName = `League ${leagueId}`;
    try {
      const fplApi = new FPLApiService();
      const leagueData = await fplApi.getLeagueStandings(parseInt(leagueId));
      leagueName = leagueData.league?.name || leagueName;
    } catch (error) {
      console.warn('Could not fetch league name, using fallback');
    }

    // Send email to each subscriber
    for (const subscriber of subscribers) {
      try {
        const emailResult = await emailService.sendGameweekSummary(
          subscriber.email,
          leagueName,
          stories || [],
          currentGameweek
        );

        if (emailResult.success) {
          // Update last sent timestamp
          await prisma.newsletterSubscription.update({
            where: { id: subscriber.id },
            data: { lastSentAt: new Date() }
          });
          successCount++;
          results.push({
            email: subscriber.email,
            success: true,
            messageId: emailResult.messageId
          });
        } else {
          errorCount++;
          results.push({
            email: subscriber.email,
            success: false,
            error: emailResult.error
          });
        }
      } catch (error) {
        errorCount++;
        results.push({
          email: subscriber.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Add small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📧 Bulk newsletter sent: ${successCount} successful, ${errorCount} failed for league ${leagueId}`);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${successCount} out of ${subscribers.length} subscribers`,
      sentCount: successCount,
      errorCount: errorCount,
      details: results
    });

  } catch (error) {
    console.error('Bulk newsletter sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk newsletter' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscribers for a league
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        leagueId: parseInt(leagueId),
        isActive: true
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        lastSentAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      leagueId: parseInt(leagueId),
      subscriberCount: subscribers.length,
      subscribers: subscribers
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}