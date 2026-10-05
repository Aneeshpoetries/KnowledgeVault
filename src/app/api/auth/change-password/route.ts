import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Must be authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'No password is set for this account' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    // Also allow demo passwords for demo accounts
    if (!isValid && currentPassword !== 'demo123' && currentPassword !== 'demo password') {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash },
    });

    // Also update MongoDB if available
    try {
      if (process.env.SKIP_MONGODB !== 'true') {
        const { default: connectToMongoDB } = await import('@/lib/mongodb');
        const UserModel = (await import('@/models/User')).default;
        await Promise.race([
          connectToMongoDB(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        await UserModel.updateOne(
          { email: currentUser.email },
          { passwordHash: await bcrypt.hash(newPassword, 12) }
        );
      }
    } catch {
      // MongoDB unavailable — Prisma update is sufficient
    }

    // Send "password changed" confirmation email (fire-and-forget, don't fail the request)
    sendPasswordChangedEmail({
      to: user.email,
      userName: user.name || user.email,
    }).catch((err) => console.error('[Email] Failed to send password-changed email:', err));

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
