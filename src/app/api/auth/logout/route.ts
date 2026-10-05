import { NextResponse } from 'next/server';
import {
  getSessionTokenFromCookie,
  deleteMongoSession,
  clearSessionCookie,
  getMongoCurrentUser,
} from '@/lib/mongo-auth';
import { logAudit } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getMongoCurrentUser();
    const token = await getSessionTokenFromCookie();

    if (token) {
      await deleteMongoSession(token);
    }

    if (user) {
      await logAudit({
        userName: user.name,
        userRole: user.role,
        action: 'LOGOUT',
        resourceType: 'SYSTEM',
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if DB fails
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
