import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendInstance(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(process.env.RESEND_API_KEY &&
                          process.env.FROM_EMAIL &&
                          process.env.RESEND_API_KEY !== 'your_resend_api_key_here');

    if (!this.isConfigured) {
      console.warn('⚠️  Email service not configured. Set RESEND_API_KEY and FROM_EMAIL environment variables.');
      console.warn('💡 Current RESEND_API_KEY:', process.env.RESEND_API_KEY === 'your_resend_api_key_here' ? 'PLACEHOLDER VALUE - Please set actual API key' : 'MISSING');
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      console.log('📧 Email service not configured - simulating email send');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content: ${options.html.substring(0, 200)}...`);
      console.warn('⚠️  IMPORTANT: To send real emails, configure RESEND_API_KEY in .env.local');

      return {
        success: false,
        error: 'Email service not configured. Set RESEND_API_KEY environment variable.',
        messageId: `demo-${Date.now()}`,
      };
    }

    try {
      const resendInstance = getResendInstance();
      const result = await resendInstance.emails.send({
        from: options.from || process.env.FROM_EMAIL || 'noreply@fplranker.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (result.error) {
        console.error('❌ Email sending failed:', result.error);
        return {
          success: false,
          error: result.error.message,
        };
      }

      console.log(`✅ Email sent successfully to ${options.to} - ID: ${result.data?.id}`);
      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error('❌ Email service error:', error);

      // Provide more specific error messages
      let errorMessage = 'Unknown email error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'API key is invalid - please check your RESEND_API_KEY configuration';
          console.error('🔑 API Key Issue: Please verify RESEND_API_KEY in .env.local');
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendGameweekSummary(
    email: string,
    leagueName: string,
    stories: any[],
    gameweek: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `📰 ${leagueName} - Gameweek ${gameweek} Summary`;
    const html = this.generateGameweekSummaryHTML(leagueName, stories, email, gameweek);

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendTeamAnalysis(
    email: string,
    leagueName: string,
    gameweek: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `📈 ${leagueName} - Team Analysis Summary (GW${gameweek})`;
    const html = this.generateTeamAnalysisHTML(leagueName, gameweek, email);

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendContactFormEmail(
    name: string,
    email: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `📬 New Contact Form Submission from ${name}`;
    const html = this.generateContactFormHTML(name, email, message);

    return this.sendEmail({
      to: 'support@fplranker.com',
      subject,
      html,
      from: process.env.FROM_EMAIL || 'noreply@fplranker.com',
    });
  }

  async sendThursdayReminder(
    email: string,
    leagueName: string,
    leagueId: number,
    upcomingGameweek: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `⏰ FPL Deadline Reminder - Gameweek ${upcomingGameweek} | ${leagueName}`;
    const html = this.generateThursdayReminderHTML(email, leagueName, leagueId, upcomingGameweek);

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  private generateGameweekSummaryHTML(leagueName: string, stories: any[], email: string, gameweek: number): string {
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .story { margin-bottom: 30px; padding: 20px; border-left: 4px solid #667eea; background: #f8f9fa; border-radius: 0 8px 8px 0; }
          .story-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
          .story-subtitle { font-size: 14px; color: #667eea; font-weight: 600; margin-bottom: 10px; }
          .story-content { font-size: 14px; line-height: 1.6; color: #555; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .emoji { font-size: 24px; }
          .highlight-box { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .stat-item { background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; }
          .story-number { background: #667eea; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px; }
          .action-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">📰</div>
            <h1>FPL League Newsletter</h1>
            <h2>${leagueName}</h2>
            <p>Gameweek ${gameweek} Summary</p>
            <p>${currentDate}</p>
          </div>

          <div class="content">
            <p>Hello FPL Manager!</p>
            <p>Here's your weekly newsletter for <strong>${leagueName}</strong> covering Gameweek ${gameweek}:</p>

            <div class="highlight-box">
              <h3 style="color: #1565c0; margin-top: 0;">📊 This Week's Summary</h3>
              <ul style="color: #1976d2; font-weight: 500;">
                <li>📈 ${stories.length} major storylines from Gameweek ${gameweek}</li>
                <li>🏆 League standings and position changes</li>
                <li>⚡ Top performers and captain choices</li>
                <li>📋 Key insights and analysis</li>
              </ul>
            </div>

            <h3 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px;">🔥 Top Headlines</h3>
            ${stories.slice(0, 6).map((story, index) => `
              <div class="story">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span class="story-number">${index + 1}</span>
                  <div class="story-title">${story.headline || `Gameweek ${gameweek} Update`}</div>
                </div>
                <div class="story-subtitle">${story.subheadline || `Latest from ${leagueName}`}</div>
                <div class="story-content">${story.details || story.content || `Key developments from this gameweek's action.`}</div>
                ${story.points ? `<p style="background: #f0f8ff; padding: 8px; border-radius: 4px; margin: 10px 0;"><strong>🎯 Points: ${story.points}</strong></p>` : ''}
                <p style="font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 8px; margin-top: 12px;"><em>👤 ${story.teamName ? `Team: ${story.teamName}` : `League: ${leagueName}`} ${story.managerName ? `| Manager: ${story.managerName}` : ''}</em></p>
              </div>
            `).join('')}

            <div class="action-box">
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
            <p style="font-size: 18px; margin-bottom: 10px;">📊 fplranker.com Newsletter</p>
            <p style="margin-bottom: 15px;">You're subscribed to weekly updates for <strong>${leagueName}</strong></p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-size: 14px;">📧 Newsletter delivered to: ${email}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gameweek ${gameweek} Summary | Generated on ${currentDate}</p>
            </div>
            <p style="font-size: 11px; opacity: 0.7; margin-top: 20px;">
              🔧 Powered by fplranker.com | Want to unsubscribe? Reply to this email
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTeamAnalysisHTML(leagueName: string, gameweek: number, email: string): string {
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .analysis-section { margin-bottom: 25px; padding: 20px; border-left: 4px solid #00b894; background: #f8fffe; border-radius: 0 8px 8px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #2d3436; display: flex; align-items: center; }
          .section-icon { margin-right: 8px; font-size: 20px; }
          .highlight-box { background: linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #00b894; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .stat-item { background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #00b894; }
          .stat-label { font-size: 12px; color: #636e72; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { background: #2d3436; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 24px;">📈</div>
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

            <div class="highlight-box">
              <h3 style="color: #00b894; margin-top: 0; text-align: center;">📱 Access Your Full Analysis</h3>
              <p style="text-align: center;">Visit fplranker.com to view detailed squad breakdowns, position-by-position analysis, and interactive charts showing your league's progression.</p>
            </div>

            <p style="text-align: center; font-size: 16px; color: #2d3436;">Get the edge you need to climb your mini-league!</p>
            <p style="text-align: center; font-size: 18px;">Good luck for Gameweek ${gameweek + 1}! 🚀⚽</p>
          </div>

          <div class="footer">
            <p style="font-size: 18px; margin-bottom: 10px;">📈 fplranker.com Team Analysis</p>
            <p style="margin-bottom: 15px;">Weekly insights for <strong>${leagueName}</strong></p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-size: 14px;">📧 Analysis delivered to: ${email}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gameweek ${gameweek} Summary | Generated on ${currentDate}</p>
            </div>
            <p style="font-size: 11px; opacity: 0.7; margin-top: 20px;">
              🔧 Powered by fplranker.com | Want to unsubscribe? Reply to this email
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateContactFormHTML(name: string, email: string, message: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission - fplranker.com</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f8f9fa; padding: 20px; border-left: 4px solid #10B981; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
          .info-label { font-weight: bold; color: #2d3436; margin-bottom: 5px; }
          .info-value { color: #555; }
          .message-box { background: #e8f4fd; padding: 20px; border-radius: 8px; border: 1px solid #10B981; margin: 20px 0; }
          .footer { background: #2d3436; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 24px;">📬</div>
            <h1>New Contact Form Submission</h1>
            <p>fplranker.com</p>
            <p style="font-size: 14px; opacity: 0.9;">${currentDate}</p>
          </div>

          <div class="content">
            <h2 style="color: #2d3436; margin-bottom: 20px;">Contact Details</h2>

            <div class="info-box">
              <div class="info-label">👤 Name:</div>
              <div class="info-value">${name}</div>
            </div>

            <div class="info-box">
              <div class="info-label">📧 Email:</div>
              <div class="info-value"><a href="mailto:${email}" style="color: #10B981;">${email}</a></div>
            </div>

            <h3 style="color: #2d3436; margin-top: 30px; margin-bottom: 15px;">💬 Message:</h3>
            <div class="message-box">
              <p style="white-space: pre-wrap; margin: 0; color: #2d3436; line-height: 1.8;">${message}</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #856404;">
                <strong>⚡ Action Required:</strong> Please respond to this inquiry within 48 hours to maintain our excellent customer service standards.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${email}?subject=Re: Your inquiry to fplranker.com"
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reply to ${name}
              </a>
            </div>
          </div>

          <div class="footer">
            <p style="font-size: 16px; margin-bottom: 10px;">📧 fplranker.com Contact Form</p>
            <p style="font-size: 12px; opacity: 0.8; margin: 0;">
              This is an automated notification from the fplranker.com contact form.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateThursdayReminderHTML(email: string, leagueName: string, leagueId: number, upcomingGameweek: number): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate deadline (typically Friday 18:30 UK time)
    const deadline = 'Friday 18:30 UK time';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FPL Deadline Reminder - ${leagueName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background: #FFF3CD; border: 2px solid #FFC107; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .action-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; color: white; }
          .checklist { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .checklist-item { padding: 10px 0; border-bottom: 1px solid #dee2e6; }
          .checklist-item:last-child { border-bottom: none; }
          .footer { background: #2d3436; color: white; padding: 20px; text-align: center; }
          .cta-button { display: inline-block; padding: 15px 40px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
          .countdown-box { background: #FFF; border: 3px solid #FF6B6B; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
            <h1>Gameweek ${upcomingGameweek} Deadline Approaching!</h1>
            <p style="font-size: 18px; margin-bottom: 0;">${leagueName}</p>
            <p style="font-size: 14px; opacity: 0.9;">${currentDate}</p>
          </div>

          <div class="content">
            <div class="alert-box">
              <h2 style="color: #856404; margin-top: 0; font-size: 20px;">⚠️ Don't Forget Your Team!</h2>
              <p style="color: #856404; margin-bottom: 0; font-size: 16px;">
                The deadline for Gameweek ${upcomingGameweek} is coming up soon. Make sure your team is ready!
              </p>
            </div>

            <div class="countdown-box">
              <div style="font-size: 48px; font-weight: bold; color: #FF6B6B; margin-bottom: 10px;">⏱️</div>
              <h3 style="color: #2d3436; margin: 10px 0;">Deadline</h3>
              <p style="font-size: 24px; font-weight: bold; color: #FF6B6B; margin: 10px 0;">${deadline}</p>
              <p style="color: #666; margin-bottom: 0;">Time is running out! Make your moves now.</p>
            </div>

            <h3 style="color: #2d3436; margin-top: 30px;">✅ Pre-Deadline Checklist</h3>
            <div class="checklist">
              <div class="checklist-item">
                <strong>🔄 Make Transfers:</strong> Review your squad and make necessary changes
              </div>
              <div class="checklist-item">
                <strong>👑 Pick Captain:</strong> Choose wisely - your captain scores double points!
              </div>
              <div class="checklist-item">
                <strong>📋 Check Starting XI:</strong> Ensure your best team is selected
              </div>
              <div class="checklist-item">
                <strong>🚨 Verify Formations:</strong> Make sure you have a valid formation (1 GK, 3-5 DEF, 2-5 MID, 1-3 FWD)
              </div>
              <div class="checklist-item">
                <strong>💰 Monitor Price Changes:</strong> Act fast if your players are about to drop in value
              </div>
              <div class="checklist-item">
                <strong>🩺 Check Injuries:</strong> Review injury news and press conferences
              </div>
            </div>

            <div class="action-box">
              <h3 style="margin-top: 0; font-size: 22px;">🏆 Visit fplranker.com</h3>
              <p style="margin-bottom: 20px; opacity: 0.95;">
                Check your mini-league standings, view rival teams, and get insights throughout the gameweek matches!
              </p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://fplranker.com'}/league/${leagueId}"
                 style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View ${leagueName} →
              </a>
            </div>

            <h3 style="color: #2d3436; margin-top: 30px;">📊 What to Expect This Gameweek</h3>
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Live Updates:</strong> Track all matches and player performances in real-time</li>
                <li><strong>League Rankings:</strong> See how your rivals are doing throughout the gameweek</li>
                <li><strong>Performance Tracking:</strong> Monitor captain choices, transfers, and team selections</li>
                <li><strong>Community Polls:</strong> Participate in polls and see what other managers are thinking</li>
              </ul>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #856404;">
                <strong>💡 Pro Tip:</strong> Visit fplranker.com during matches to see live score updates and track how your team is performing against your mini-league rivals!
              </p>
            </div>

            <p style="text-align: center; font-size: 16px; color: #2d3436; margin-top: 30px;">
              Good luck for Gameweek ${upcomingGameweek}! 🍀⚽
            </p>
          </div>

          <div class="footer">
            <p style="font-size: 18px; margin-bottom: 10px;">⏰ fplranker.com Deadline Reminder</p>
            <p style="margin-bottom: 15px;">You're subscribed to updates for <strong>${leagueName}</strong></p>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0; font-size: 14px;">📧 Reminder sent to: ${email}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Gameweek ${upcomingGameweek} | ${currentDate}</p>
            </div>
            <p style="font-size: 11px; opacity: 0.7; margin-top: 20px;">
              🔧 Powered by fplranker.com | Want to unsubscribe? Reply to this email
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}