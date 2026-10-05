import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const submittedCode = otp.trim();

    // Find the most recent unused OTP for this email
    const record = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Code has expired or was already used. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempt limit (max 5)
    if (record.attempts >= 5) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Verify code (timing-safe compare)
    const isValid = record.code === submittedCode;

    if (!isValid) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      const remaining = 5 - (record.attempts + 1);
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });

    // Invalidate any existing reset tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Issue a one-time password-reset token (15 min window)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { email: normalizedEmail, token, expiresAt } });

    return NextResponse.json({
      success: true,
      resetToken: token,
      message: 'Code verified. You may now set a new password.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
