import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'newsletter' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();

    if (type === 'team-analysis') {
      const result = await emailService.sendTeamAnalysis(
        email,
        'Test League',
        6
      );

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Team analysis test email sent!' : 'Failed to send test email',
        messageId: result.messageId,
        error: result.error
      });
    } else {
      // Test newsletter
      const testStories = [
        {
          headline: 'Top Scorer This Week',
          subheadline: 'Amazing performance in Gameweek 6',
          details: 'The captain choice paid off with a fantastic haul of points.',
          points: 68,
          teamName: 'Test Team FC',
          managerName: 'Test Manager'
        },
        {
          headline: 'Surprise Climber',
          subheadline: 'Moved up 3 positions',
          details: 'Smart transfers and a differential captain choice led to a great week.',
          points: 62,
          teamName: 'Rising Stars',
          managerName: 'Lucky Manager'
        }
      ];

      const result = await emailService.sendGameweekSummary(
        email,
        'Test League',
        testStories,
        6
      );

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Newsletter test email sent!' : 'Failed to send test email',
        messageId: result.messageId,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}