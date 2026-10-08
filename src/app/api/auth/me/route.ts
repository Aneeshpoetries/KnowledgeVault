import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMongoCurrentUser } from '@/lib/mongo-auth';
import { DEMO_USERS, getOfflineDemoUser, verifySessionToken } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/types';

export async function GET() {
  // Resolve signed local demo sessions before contacting MongoDB.
  const cookieStore = await cookies();
  const demoToken = cookieStore.get('vault_session_token')?.value;
  const demoPayload = demoToken ? verifySessionToken(demoToken) : null;
  if (demoPayload && demoPayload.userId === `demo-${demoPayload.role}` && demoPayload.email === DEMO_USERS[demoPayload.role as UserRole]?.email) {
    const demoUser = getOfflineDemoUser(demoPayload.role as UserRole);
    if (demoUser) return NextResponse.json({ authenticated: true, user: { ...demoUser, isDemo: true } });
  }
  // 1. Try MongoDB first (if not skipped)
  const user = await getMongoCurrentUser();
  if (user) {
    return NextResponse.json({ authenticated: true, user });
  }

  // 2. Fallback to Prisma session
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vault_session_token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    if (payload.userId === `demo-${payload.role}` && payload.email === DEMO_USERS[payload.role as UserRole]?.email) {
      const demoUser = getOfflineDemoUser(payload.role as UserRole);
      if (demoUser) return NextResponse.json({ authenticated: true, user: { ...demoUser, isDemo: true } });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { employee: true },
    });

    if (!dbUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const userRole = (dbUser.role as UserRole) || 'EMPLOYEE';
    
    const fallbackUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: userRole,
      title: dbUser.title || dbUser.employee?.role || 'Team Member',
      avatar: dbUser.avatar || dbUser.employee?.avatar || undefined,
      department: dbUser.employee?.department || 'Core Engineering',
      permissions: ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE,
      isDemo: true,
    };

    return NextResponse.json({ authenticated: true, user: fallbackUser });
  } catch (err) {
    console.error('Prisma auth fallback error:', err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
