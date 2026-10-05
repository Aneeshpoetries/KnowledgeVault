import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    // Always return the same response to prevent email enumeration attacks
    const genericResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) {
      // Simulate delay so timing doesn't reveal whether email exists
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json(genericResponse);
    }

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // Send the email
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      userName: user.name || normalizedEmail,
      resetLink,
    });

    // In dev with no email provider: return link in response for easy testing
    const isDev = process.env.NODE_ENV !== 'production';
    const noProvider = emailResult.provider === 'console';

    return NextResponse.json({
      ...genericResponse,
      ...(isDev && noProvider
        ? {
            // Dev-only: expose link when no email provider is set up
            _dev: true,
            resetLink,
            provider: 'console',
            hint: 'No email provider configured. Add RESEND_API_KEY or SMTP credentials to .env to send real emails.',
          }
        : {
            provider: emailResult.provider,
          }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
