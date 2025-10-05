import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/services/email-service';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
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

    // Get email service instance
    const emailService = EmailService.getInstance();

    // Send email to support@fplranker.com
    const emailResult = await emailService.sendContactFormEmail(
      name,
      email,
      message
    );

    if (!emailResult.success) {
      console.error('Failed to send contact form email:', emailResult.error);

      // Check if it's a configuration issue
      const isConfigurationError = emailResult.error?.includes('API key is invalid') ||
                                   emailResult.error?.includes('not configured');

      return NextResponse.json({
        success: false,
        message: isConfigurationError
          ? 'Message received! Email service is currently in demo mode. We will get back to you soon.'
          : 'Failed to send message. Please try again later.',
        error: emailResult.error,
        isDemo: isConfigurationError
      }, { status: isConfigurationError ? 200 : 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      emailId: emailResult.messageId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }
}
