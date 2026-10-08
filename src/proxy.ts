import { NextRequest, NextResponse } from 'next/server';

// Demo sessions are browser-local previews. Prevent them from reaching live data APIs.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/api/auth/login' || path === '/api/auth/me' || path === '/api/auth/logout') return NextResponse.next();
  const token = request.cookies.get('vault_session_token')?.value;
  if (!token) return NextResponse.next();
  try {
    const payload = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.userId === 'string' && /^demo-(ADMIN|MANAGER|EMPLOYEE|NEW_EMPLOYEE)$/.test(payload.userId)) {
      return NextResponse.json({ error: 'Demo workspaces use the local snapshot.' }, { status: 403 });
    }
  } catch {}
  return NextResponse.next();
}

export const config = { matcher: '/api/:path*' };
