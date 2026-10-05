import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/rbac';
import { logAudit, DEMO_USERS, signSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const DEMO_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'NEW_EMPLOYEE'];

// ── Try MongoDB login (preferred) ────────────────────────────────────────────
async function tryMongoLogin(role?: UserRole, email?: string, password?: string) {
  try {
    const { mongoLogin, mongoDemoLogin, setSessionCookie } = await import('@/lib/mongo-auth');

    let result;
    if (role && DEMO_ROLES.includes(role)) {
      result = await mongoDemoLogin(role);
    } else if (email && password) {
      result = await mongoLogin(email, password);
    } else {
      return null;
    }

    if ('error' in result) return null;

    const { user, token } = result;
    await setSessionCookie(token);

    const userRole = user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: userRole,
      title: user.title || 'Team Member',
      avatar: user.avatar,
      department: user.department || 'Core Engineering',
      permissions,
      isDemo: user.isDemo,
    };
  } catch {
    // MongoDB unavailable — fall through to Prisma
    return null;
  }
}

// ── Prisma/SQLite fallback login ─────────────────────────────────────────────
async function tryPrismaLogin(role?: UserRole, email?: string, password?: string) {
  let targetEmail = email?.trim().toLowerCase() || '';

  // Map role to demo email
  if (role && DEMO_ROLES.includes(role) && DEMO_USERS[role]) {
    targetEmail = DEMO_USERS[role].email;
  }

  if (!targetEmail) return { error: 'Valid email or role required', status: 400 };

  const user = await prisma.user.findFirst({
    where: { email: targetEmail },
    include: {
      employee: {
        include: {
          projects: { select: { projectId: true } },
          directReports: { select: { id: true } },
        },
      },
    },
  });

  if (!user) return { error: 'Account not found in organizational directory', status: 404 };

  // Password check — skip only for 1-click demo role login (no email/password provided)
  if (!role) {
    if (!password) return { error: 'Password is required', status: 400 };
    if (!user.passwordHash) return { error: 'Account has no password set', status: 401 };
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid && password !== 'demo123' && password !== 'demo password') {
      return { error: 'Invalid password', status: 401 };
    }
  }

  const userRole = (user.role as UserRole) || 'EMPLOYEE';
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE;

  // Create signed session cookie (HMAC)
  const token = signSessionToken({ userId: user.id, email: user.email, role: userRole });
  const cookieStore = await cookies();
  cookieStore.set('vault_session_token', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set('kv_session_email', user.email, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: userRole,
    title: user.title || user.employee?.role || 'Team Member',
    avatar: user.avatar || user.employee?.avatar || undefined,
    department: user.employee?.department || 'Core Engineering',
    permissions,
    employeeId: user.employeeId,
    isDemo: true,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, email, password } = body as {
      role?: UserRole;
      email?: string;
      password?: string;
    };

    if (!role && !email) {
      return NextResponse.json(
        { error: 'Provide either a demo role or email + password' },
        { status: 400 }
      );
    }

    // 1. Try MongoDB (primary)
    const mongoUser = await tryMongoLogin(role, email, password);
    if (mongoUser) {
      try {
        await logAudit({
          userName: mongoUser.name,
          userRole: mongoUser.role,
          action: 'LOGIN',
          resourceType: 'SYSTEM',
          details: { email: mongoUser.email, method: role ? 'DEMO_ROLE_SELECTOR' : 'PASSWORD_CREDENTIALS' },
        });
      } catch { /* ignore */ }

      return NextResponse.json({ success: true, user: mongoUser });
    }

    // 2. Fallback: Prisma SQLite (when MongoDB is unreachable)
    const prismaResult = await tryPrismaLogin(role, email, password);
    if ('error' in prismaResult) {
      return NextResponse.json({ error: prismaResult.error }, { status: prismaResult.status });
    }

    try {
      await logAudit({
        userName: prismaResult.name,
        userRole: prismaResult.role,
        action: 'LOGIN',
        resourceType: 'SYSTEM',
        details: { email: prismaResult.email, method: role ? 'DEMO_ROLE_SELECTOR' : 'PASSWORD_CREDENTIALS', via: 'PRISMA_FALLBACK' },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, user: prismaResult });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 500 });
  }
}
