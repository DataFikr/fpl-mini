import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, leagueId, leagueName, stories, gameweek, subscriptionType = 'newsletter' } = await request.json();

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

      let subscription;
      if (existingSubscription) {
        subscription = await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            isActive: true,
            lastSentAt: new Date()
          }
        });
      } else {
        subscription = await prisma.newsletterSubscription.create({
          data: {
            email: email.toLowerCase(),
            leagueId: parseInt(leagueId),
            isActive: true,
            lastSentAt: new Date()
          }
        });
      }

      console.log(`📧 Email subscription saved: ${email} for league ${leagueId} (ID: ${subscription.id})`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Handle different subscription types
    if (subscriptionType === 'team-analysis' || (gameweek && !stories)) {
      console.log(`📧 Team analysis subscription confirmed for ${email} for league ${leagueId}, gameweek ${gameweek}`);

      // Generate team analysis summary
      const teamAnalysisSummary = generateTeamAnalysisEmail(leagueName || `League ${leagueId}`, gameweek || 5, email);

      return NextResponse.json({
        success: true,
        message: 'Subscription saved! You will receive weekly team analysis summaries.',
        content: teamAnalysisSummary
      });
    }

    // Generate newsletter content for storytelling subscriptions
    const newsletterContent = generateNewsletterHTML(
      leagueName || `League ${leagueId}`,
      stories || [],
      email,
      gameweek || 5
    );

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

function generateNewsletterHTML(leagueName: string, stories: any[], email: string, gameweek: number): string {
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
          <h1>📰 FPL League Newsletter</h1>
          <h2>${leagueName}</h2>
          <p>Gameweek ${gameweek} Summary</p>
          <p>${currentDate}</p>
        </div>

        <div class="content">
          <p>Hello FPL Manager!</p>
          <p>Here's your weekly newsletter for <strong>${leagueName}</strong> covering Gameweek ${gameweek}:</p>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">📊 This Week's Summary</h3>
            <ul style="color: #1976d2; font-weight: 500;">
              <li>📈 ${stories.length} major storylines from Gameweek ${gameweek}</li>
              <li>🏆 League standings and position changes</li>
              <li>⚡ Top performers and captain choices</li>
              <li>📋 Key insights and analysis</li>
            </ul>
          </div>

          <h3 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px;">🔥 Top 6 Headlines</h3>
          ${stories.slice(0, 6).map((story, index) => `
            <div class="story">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px;">${index + 1}</span>
                <div class="story-title">${story.headline}</div>
              </div>
              <div class="story-subtitle">${story.subheadline}</div>
              <div class="story-content">${story.details}</div>
              ${story.points ? `<p style="background: #f0f8ff; padding: 8px; border-radius: 4px; margin: 10px 0;"><strong>🎯 Points: ${story.points}</strong></p>` : ''}
              <p style="font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 8px; margin-top: 12px;"><em>👤 Team: ${story.teamName} | Manager: ${story.managerName}</em></p>
            </div>
          `).join('')}

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #28a745; margin-top: 0;">🚀 Coming Up</h3>
            <p>Get ready for Gameweek ${gameweek + 1}! Keep an eye on:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>🔄 Transfer deadline: Friday 11:30 GMT</li>
              <li>👨‍💼 Captain choices and differentials</li>
              <li>📈 Form players and fixture analysis</li>
            </ul>
          </div>

          <p style="text-align: center; font-size: 16px; color: #2c3e50;">Stay tuned for more exciting updates from your league!</p>
          <p style="text-align: center; font-size: 18px;">Best of luck for Gameweek ${gameweek + 1}! 🍀⚽</p>
        </div>

        <div class="footer">
          <p style="font-size: 18px; margin-bottom: 10px;">📊 FPL League Hub Newsletter</p>
          <p style="margin-bottom: 15px;">You're subscribed to weekly updates for <strong>${leagueName}</strong></p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px;">📧 Newsletter delivered to: ${email}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gameweek ${gameweek} Summary | Generated on ${currentDate}</p>
          </div>
          <p style="font-size: 11px; opacity: 0.7; margin-top: 20px;">
            🔧 Powered by FPL League Hub | Want to unsubscribe? Reply to this email
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTeamAnalysisEmail(leagueName: string, gameweek: number, email: string): string {
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
      <title>FPL Team Analysis Summary - ${leagueName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; }
        .analysis-section { margin-bottom: 25px; padding: 20px; border-left: 4px solid #00b894; background: #f8fffe; border-radius: 0 8px 8px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #2d3436; display: flex; align-items: center; }
        .section-icon { margin-right: 8px; font-size: 20px; }
        .highlight-box { background: linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #00b894; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
        .stat-item { background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #00b894; }
        .stat-label { font-size: 12px; color: #636e72; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { background: #2d3436; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .emoji { font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">📈</div>
          <h1>Team Analysis Summary</h1>
          <h2>${leagueName}</h2>
          <p>Gameweek ${gameweek} Insights</p>
          <p>${currentDate}</p>
        </div>

        <div class="content">
          <p>Hello FPL Manager!</p>
          <p>Here's your comprehensive team analysis summary for <strong>${leagueName}</strong> Gameweek ${gameweek}:</p>

          <div class="highlight-box">
            <h3 style="color: #00b894; margin-top: 0; text-align: center;">🎯 Your Weekly Summary</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">GW ${gameweek}</div>
                <div class="stat-label">Current Week</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">📊</div>
                <div class="stat-label">Analysis Ready</div>
              </div>
            </div>
          </div>

          <div class="analysis-section">
            <div class="section-title">
              <span class="section-icon">🏆</span>
              League Performance Overview
            </div>
            <p>📈 <strong>Position Changes:</strong> Track how teams moved up and down the rankings this gameweek</p>
            <p>⭐ <strong>Top Performers:</strong> Identify the highest scoring teams and standout players</p>
            <p>📉 <strong>Disappointing Returns:</strong> Analyze underperforming assets and missed opportunities</p>
          </div>

          <div class="analysis-section">
            <div class="section-title">
              <span class="section-icon">🧠</span>
              Strategic Insights
            </div>
            <p>👑 <strong>Captain Choices:</strong> See which captain picks paid off and which didn't</p>
            <p>🔄 <strong>Transfer Trends:</strong> Popular moves and template changes in your league</p>
            <p>💡 <strong>Template Analysis:</strong> How your team compares to the league template</p>
          </div>

          <div class="analysis-section">
            <div class="section-title">
              <span class="section-icon">🔮</span>
              Looking Ahead to GW ${gameweek + 1}
            </div>
            <p>📅 <strong>Fixture Analysis:</strong> Best fixtures and potential rotation risks</p>
            <p>💰 <strong>Value Picks:</strong> Budget-friendly options that could deliver points</p>
            <p>🎲 <strong>Differential Opportunities:</strong> Low-owned players who could provide an edge</p>
          </div>

          <div class="highlight-box">
            <h3 style="color: #00b894; margin-top: 0; text-align: center;">📱 Access Your Full Analysis</h3>
            <p style="text-align: center;">Visit the FPL League Hub to view detailed squad breakdowns, position-by-position analysis, and interactive charts showing your league's progression.</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #e17055; margin-top: 0;">⚡ Quick Actions for GW ${gameweek + 1}</h3>
            <ul style="text-align: left; display: inline-block;">
              <li>🔍 Review your team's performance vs league average</li>
              <li>📋 Plan transfers for upcoming fixtures</li>
              <li>👑 Choose your captain wisely</li>
              <li>🎯 Consider differential picks to gain ground</li>
            </ul>
          </div>

          <p style="text-align: center; font-size: 16px; color: #2d3436;">Get the edge you need to climb your mini-league!</p>
          <p style="text-align: center; font-size: 18px;">Good luck for Gameweek ${gameweek + 1}! 🚀⚽</p>
        </div>

        <div class="footer">
          <p style="font-size: 18px; margin-bottom: 10px;">📈 FPL Team Analysis</p>
          <p style="margin-bottom: 15px;">Weekly insights for <strong>${leagueName}</strong></p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px;">📧 Analysis delivered to: ${email}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gameweek ${gameweek} Summary | Generated on ${currentDate}</p>
          </div>
          <p style="font-size: 11px; opacity: 0.7; margin-top: 20px;">
            🔧 Powered by FPL League Hub | Want to unsubscribe? Reply to this email
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}