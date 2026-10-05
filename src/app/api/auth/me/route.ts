import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMongoCurrentUser } from '@/lib/mongo-auth';
import { verifySessionToken } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/types';

export async function GET() {
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
