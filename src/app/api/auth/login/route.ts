import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { DEMO_USERS, signSessionToken, verifyPassword, logAudit } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/rbac';

const EMAIL_ALIASES: Record<string, string> = {
  'admin@novatech.ai': 'marcus@novatech.demo',
  'manager@novatech.ai': 'sarah@novatech.demo',
  'rahul@novatech.ai': 'rahul@novatech.demo',
  'newhire@novatech.ai': 'alex@novatech.demo',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, email, password } = body;

    let targetEmail = (email || '').trim().toLowerCase();

    // Map alias or role
    if (role && DEMO_USERS[role as UserRole]) {
      targetEmail = DEMO_USERS[role as UserRole].email;
    } else if (EMAIL_ALIASES[targetEmail]) {
      targetEmail = EMAIL_ALIASES[targetEmail];
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Valid email or role selection required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: targetEmail }, { email: targetEmail.toLowerCase() }],
      },
      include: {
        employee: {
          include: {
            projects: { select: { projectId: true } },
            directReports: { select: { id: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Account not found in organizational directory' }, { status: 404 });
    }

    // If password provided and not 1-click demo role login, verify password
    if (password && !role && user.passwordHash) {
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid && password !== 'demo123' && password !== 'demo password') {
        return NextResponse.json({ error: 'Invalid password. (Use "demo123" for demo accounts)' }, { status: 401 });
      }
    }

    const userRole = (user.role as UserRole) || 'EMPLOYEE';
    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE;

    // Create secure signed session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: userRole,
    });

    const cookieStore = await cookies();
    cookieStore.set('vault_session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set('kv_session_email', user.email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Record audit log
    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole,
      action: 'LOGIN',
      resourceType: 'SYSTEM',
      details: { email: user.email, method: role ? 'DEMO_ROLE_SELECTOR' : 'PASSWORD_CREDENTIALS' },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        title: user.title || user.employee?.role || 'Team Member',
        avatar: user.avatar || user.employee?.avatar,
        department: user.employee?.department || 'Core Engineering',
        permissions,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
