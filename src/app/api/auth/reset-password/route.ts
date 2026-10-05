import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password with bcrypt (matching the register route)
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.updateMany({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Fetch user name for email
    const user = await prisma.user.findFirst({
      where: { email: resetToken.email },
      select: { name: true, email: true },
    });

    // Send "password changed" confirmation email (fire-and-forget)
    if (user) {
      sendPasswordChangedEmail({
        to: user.email,
        userName: user.name || user.email,
      }).catch((err) => console.error('[Email] Failed to send reset-confirm email:', err));
    }

    // Also try to update MongoDB if available
    try {
      if (process.env.SKIP_MONGODB !== 'true') {
        const { default: connectToMongoDB } = await import('@/lib/mongodb');
        const UserModel = (await import('@/models/User')).default;
        await Promise.race([
          connectToMongoDB(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        await UserModel.updateOne(
          { email: resetToken.email },
          { passwordHash: await bcrypt.hash(password, 12) }
        );
      }
    } catch {
      // MongoDB unavailable — Prisma update is sufficient
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
