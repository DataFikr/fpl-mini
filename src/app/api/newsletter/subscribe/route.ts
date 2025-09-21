import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, leagueId, leagueName, stories, gameweek } = await request.json();

    if (!email || !leagueId) {
      return NextResponse.json(
        { error: 'Email and league ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save subscription to database
    try {
      const existingSubscription = await prisma.newsletterSubscription.findFirst({
        where: {
          email: email.toLowerCase(),
          leagueId: parseInt(leagueId)
        }
      });

      if (existingSubscription) {
        await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            isActive: true,
            lastSentAt: new Date()
          }
        });
      } else {
        await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            leagueId: parseInt(leagueId),
            isActive: true,
            lastSentAt: new Date()
          }
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // If subscribing from squad analysis, generate confirmation content
    if (gameweek && !stories) {
      console.log(`📧 Subscription confirmed for ${email} for league ${leagueId}, gameweek ${gameweek}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription saved! You will receive weekly league analysis updates.'
      });
    }

    // Generate newsletter content for storytelling subscriptions
    const newsletterContent = generateNewsletterHTML(leagueName || `League ${leagueId}`, stories || [], email);

    // In a real application, you would send this via email service like SendGrid, AWS SES, etc.
    // For now, we'll simulate the email sending and return success
    console.log(`📧 Newsletter sent to ${email} for league ${leagueName || leagueId}`);
    console.log('Newsletter content:', newsletterContent.substring(0, 200) + '...');

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully and subscription saved!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter subscription' },
      { status: 500 }
    );
  }
}

function generateNewsletterHTML(leagueName: string, stories: any[], email: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FPL Newsletter - ${leagueName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .story { margin-bottom: 30px; padding: 20px; border-left: 4px solid #667eea; background: #f8f9fa; }
        .story-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .story-subtitle { font-size: 14px; color: #667eea; font-weight: 600; margin-bottom: 10px; }
        .story-content { font-size: 14px; line-height: 1.6; color: #555; }
        .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .emoji { font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">📰</div>
          <h1>FPL League Newsletter</h1>
          <h2>${leagueName}</h2>
          <p>${currentDate}</p>
        </div>

        <div class="content">
          <p>Hello FPL Manager!</p>
          <p>Here are this week's top headlines from <strong>${leagueName}</strong>:</p>

          ${stories.map((story, index) => `
            <div class="story">
              <div class="story-title">${story.headline}</div>
              <div class="story-subtitle">${story.subheadline}</div>
              <div class="story-content">${story.details}</div>
              ${story.points ? `<p><strong>Points: ${story.points}</strong></p>` : ''}
              <p><em>Team: ${story.teamName} | Manager: ${story.managerName}</em></p>
            </div>
          `).join('')}

          <p>Stay tuned for more exciting updates from your league!</p>
          <p>Best of luck for the upcoming gameweek! 🍀</p>
        </div>

        <div class="footer">
          <p>📊 FPL League Hub Newsletter</p>
          <p>You're subscribed to weekly updates for ${leagueName}</p>
          <p style="font-size: 12px; opacity: 0.8;">
            This newsletter was sent to ${email}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}