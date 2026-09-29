import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser, logAudit } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGOUT',
      resourceType: 'SYSTEM',
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete('vault_session_token');
  cookieStore.delete('kv_session_email');
  return NextResponse.json({ success: true });
}
