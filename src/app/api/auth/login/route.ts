import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DEMO_USERS } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, email } = body;

    let targetEmail = email;
    if (role && DEMO_USERS[role as UserRole]) {
      targetEmail = DEMO_USERS[role as UserRole].email;
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email or valid demo role required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set('kv_session_email', user.email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
