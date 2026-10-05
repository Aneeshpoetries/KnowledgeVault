/**
 * MongoDB-backed authentication service.
 * - Tries MongoDB Atlas first (3s timeout)
 * - If unreachable, callers fall back to Prisma/SQLite automatically
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AuthUser, ROLE_PERMISSIONS } from './rbac';
import { UserRole } from '@/lib/types';
import type { IUser } from '@/models/User';

const AUTH_COOKIE_NAME = 'vault_session_token';
const SESSION_DURATION_DAYS = 7;

// ─── Lazy MongoDB loader with 1.5s timeout ─────────────────────────────────────

async function getMongoModels() {
  // Skip MongoDB entirely if Atlas is unreachable (set SKIP_MONGODB=true in .env)
  if (process.env.SKIP_MONGODB === 'true') {
    throw new Error('MongoDB skipped (SKIP_MONGODB=true)');
  }

  const connectToMongoDB = (await import('./mongodb')).default;
  const UserModel = (await import('@/models/User')).default;
  const SessionModel = (await import('@/models/Session')).default;

  await Promise.race([
    connectToMongoDB(),
    new Promise<never>((_, reject) =>
      // Reduced from 3000ms → 1500ms: fail fast, let Prisma fallback take over sooner
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 1500)
    ),
  ]);

  return { UserModel, SessionModel };
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export async function createMongoSession(user: IUser): Promise<string> {
  const { SessionModel } = await getMongoModels();

  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await SessionModel.create({
    userId: user._id,
    token,
    email: user.email,
    role: user.role,
    expiresAt,
  });

  return token;
}

export async function getSessionUser(token: string): Promise<IUser | null> {
  const { UserModel, SessionModel } = await getMongoModels();

  const session = await SessionModel.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await UserModel.findById(session.userId);
  return user;
}

export async function deleteMongoSession(token: string): Promise<void> {
  try {
    const { SessionModel } = await getMongoModels();
    await SessionModel.deleteOne({ token });
  } catch {
    // Best effort — don't fail logout if MongoDB is down
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete('kv_session_email');
}

export async function getSessionTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function mongoLogin(
  email: string,
  password: string
): Promise<{ user: IUser; token: string } | { error: string; status: number }> {
  const { UserModel } = await getMongoModels();

  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  if (!user) return { error: 'No account found with that email address', status: 404 };

  const isValid = await user.comparePassword(password);
  if (!isValid) return { error: 'Invalid password', status: 401 };

  const token = await createMongoSession(user);
  return { user, token };
}

/** 1-click demo login — bypasses password for hardcoded demo accounts */
export async function mongoDemoLogin(
  role: UserRole
): Promise<{ user: IUser; token: string } | { error: string; status: number }> {
  const { UserModel } = await getMongoModels();

  const user = await UserModel.findOne({ role, isDemo: true });
  if (!user) {
    return {
      error: `Demo account for role ${role} not found. Run: npm run mongo:seed`,
      status: 404,
    };
  }

  const token = await createMongoSession(user);
  return { user, token };
}

// ─── In-memory user cache (server-side, per-process, 30s TTL) ─────────────────
// Avoids hammering MongoDB on every API route call for the same session token.
const _userCache = new Map<string, { user: import('./rbac').AuthUser; expiresAt: number }>();

export async function getMongoCurrentUser(): Promise<import('./rbac').AuthUser | null> {
  try {
    const token = await getSessionTokenFromCookie();
    if (!token) return null;

    // ── Cache hit: return immediately without DB round-trip ──
    const cached = _userCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }

    const user = await getSessionUser(token);
    if (!user) {
      _userCache.delete(token);
      return null;
    }

    const authUser = buildAuthUser(user);

    // ── Cache for 30 seconds (reduces DB hits dramatically on dashboard load) ──
    _userCache.set(token, { user: authUser, expiresAt: Date.now() + 30_000 });

    return authUser;
  } catch {
    return null;
  }
}

function buildAuthUser(user: IUser): AuthUser {
  const role = user.role as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.EMPLOYEE;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role,
    title: user.title || 'Team Member',
    avatar: user.avatar,
    employeeId: user.employeeId,
    department: user.department || 'Core Engineering',
    directReportIds: [],
    projectIds: [],
    permissions,
  };
}

// ─── Register new (non-demo) account ─────────────────────────────────────────

export async function mongoRegister(params: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  title?: string;
  department?: string;
  companySlug?: string;
}): Promise<{ user: IUser; token: string } | { error: string; status: number }> {
  const { UserModel } = await getMongoModels();

  const existing = await UserModel.findOne({ email: params.email.toLowerCase().trim() });
  if (existing) {
    return { error: 'An account with this email already exists', status: 409 };
  }

  const user = await UserModel.create({
    name: params.name,
    email: params.email.toLowerCase().trim(),
    passwordHash: params.password, // pre-save hook hashes it
    role: params.role || 'EMPLOYEE',
    title: params.title,
    department: params.department,
    isDemo: false,
    companySlug: params.companySlug || 'novatech',
  });

  const token = await createMongoSession(user);
  return { user, token };
}
