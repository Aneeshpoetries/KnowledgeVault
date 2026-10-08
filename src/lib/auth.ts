import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from './prisma';
import { UserRole } from './types';
import { AuthUser, Permission, ROLE_PERMISSIONS, hasPermission } from './rbac';

const AUTH_COOKIE_NAME = 'vault_session_token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'knowledgevault-ai-secret-auth-key-2026';

// Password hashing utilities using Node.js crypto
export function hashPassword(password: string): string {
  const salt = 'kv_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const computed = hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

// Token creation & verification (HMAC signed)
export function signSessionToken(payload: { userId: string; email: string; role: string }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

export function getOfflineDemoUser(role: UserRole): AuthUser | null {
  const profile = DEMO_USERS[role];
  if (!profile) return null;
  return {
    id: `demo-${role}`,
    name: profile.name,
    email: profile.email,
    role,
    title: profile.title,
    avatar: profile.avatar,
    department: profile.department,
    employeeId: role === 'EMPLOYEE' ? 'demo-rahul' : undefined,
    directReportIds: role === 'MANAGER' ? ['demo-rahul', 'demo-elena'] : [],
    projectIds: [],
    permissions: ROLE_PERMISSIONS[role],
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const demoToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const demoPayload = demoToken ? verifySessionToken(demoToken) : null;
  if (demoPayload && demoPayload.userId === `demo-${demoPayload.role}` && demoPayload.email === DEMO_USERS[demoPayload.role as UserRole]?.email) {
    return getOfflineDemoUser(demoPayload.role as UserRole);
  }
  // Try MongoDB first (primary auth system)
  try {
    const { getMongoCurrentUser } = await import('./mongo-auth');
    const mongoUser = await getMongoCurrentUser();
    if (mongoUser) return mongoUser;
  } catch {
    // MongoDB unavailable — fall through to Prisma fallback
  }

  // Fallback: legacy Prisma/SQLite auth (backward compat during migration)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const legacyEmail = cookieStore.get('kv_session_email')?.value;

    let targetEmail: string | null = null;
    let targetUserId: string | null = null;

    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        if (payload.userId === `demo-${payload.role}` && payload.email === DEMO_USERS[payload.role as UserRole]?.email) {
          return getOfflineDemoUser(payload.role as UserRole);
        }
        targetUserId = payload.userId;
        targetEmail = payload.email;
      }
    } else if (legacyEmail) {
      targetEmail = legacyEmail;
    }

    // No valid session — not authenticated
    if (!targetEmail && !targetUserId) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: targetUserId ? { id: targetUserId } : { email: targetEmail! },
      include: {
        employee: {
          include: {
            projects: { select: { projectId: true } },
            directReports: { select: { id: true } },
          },
        },
      },
    });

    if (!user) return null;

    const role = (user.role as UserRole) || 'EMPLOYEE';
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.EMPLOYEE;
    const directReportIds = user.employee?.directReports.map((r) => r.id) || [];
    const projectIds = user.employee?.projects.map((p) => p.projectId) || [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      title: user.title || user.employee?.role || 'Team Member',
      avatar: user.avatar || user.employee?.avatar || undefined,
      employeeId: user.employeeId || undefined,
      department: user.employee?.department || 'Core Engineering',
      directReportIds,
      projectIds,
      permissions,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}


export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasPermission(user, permission)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export async function logAudit(
  userOrParams:
    | AuthUser
    | null
    | undefined
    | {
        userId?: string;
        userName: string;
        userRole: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
      },
  action?: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  try {
    let finalUserId: string | undefined;
    let finalUserName: string | undefined;
    let finalUserRole: string | undefined;
    let finalAction: string;
    let finalResourceType: string;
    let finalResourceId: string | undefined;
    let finalDetails: any;
    let ipAddress: string = '127.0.0.1';

    if (typeof action === 'string') {
      const user = userOrParams as AuthUser | null | undefined;
      finalUserId = user?.id;
      finalUserName = user?.name || 'Anonymous User';
      finalUserRole = user?.role || 'EMPLOYEE';
      finalAction = action;
      finalResourceType = resourceType || 'SYSTEM';
      finalResourceId = resourceId;
      finalDetails = details;
    } else {
      const p = userOrParams as {
        userId?: string;
        userName: string;
        userRole: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
      };
      finalUserId = p.userId;
      finalUserName = p.userName;
      finalUserRole = p.userRole;
      finalAction = p.action;
      finalResourceType = p.resourceType || 'SYSTEM';
      finalResourceId = p.resourceId;
      finalDetails = p.details;
      ipAddress = p.ipAddress || '127.0.0.1';
    }

    await prisma.auditLog.create({
      data: {
        userId: finalUserId,
        userName: finalUserName || 'System',
        userRole: finalUserRole || 'SYSTEM',
        action: finalAction,
        resourceType: finalResourceType,
        resourceId: finalResourceId,
        detailsJson: finalDetails ? JSON.stringify(finalDetails) : null,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}

export const DEMO_PROFILES: Record<
  UserRole,
  {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    title: string;
    department: string;
    accessLevel: string;
    scope: string;
    avatar: string;
    description: string;
  }
> = {
  ADMIN: {
    name: 'Marcus Vance',
    email: 'marcus@novatech.demo',
    password: 'demo password',
    role: 'ADMIN',
    title: 'Engineering Director',
    department: 'Engineering Leadership',
    accessLevel: 'Organization Administrator (Full Access)',
    scope: 'Entire Organization · All Employees · All Projects · Full Governance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    description: 'Govern organizational memory, resolve risk bottlenecks, configure AI, and view global audit logs.',
  },
  MANAGER: {
    name: 'Sarah Lin',
    email: 'sarah@novatech.demo',
    password: 'demo password',
    role: 'MANAGER',
    title: 'Engineering Manager',
    department: 'Core Infrastructure & Payments',
    accessLevel: 'Team Manager (Departmental Scope)',
    scope: 'Core Infrastructure Team · Assigned Projects · Knowledge Approval Queue',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    description: 'Review knowledge submissions from direct reports, monitor team coverage, and initiate targeted Exit Interviews.',
  },
  EMPLOYEE: {
    name: 'Rahul Sharma',
    email: 'rahul@novatech.demo',
    password: 'demo password',
    role: 'EMPLOYEE',
    title: 'Staff Infrastructure Engineer',
    department: 'Core Infrastructure & Payments',
    accessLevel: 'Senior Contributor (Exit Pending)',
    scope: 'Payment System · Personal Knowledge Holdings · Exit Knowledge Recovery',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Holds 73% of payment engine operational tacit memory. Prepares handover runbooks and completes offboarding Q&A.',
  },
  NEW_EMPLOYEE: {
    name: 'Alex Chen',
    email: 'alex@novatech.demo',
    password: 'demo password',
    role: 'NEW_EMPLOYEE',
    title: 'Junior Developer',
    department: 'Core Infrastructure & Payments',
    accessLevel: 'Onboarding Developer (Learning Scope)',
    scope: 'Approved Documentation · Assigned Projects · Guided AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    description: 'Ramps up on payment services, asks questions against approved runbooks, and tracks onboarding progress.',
  },
};

export const DEMO_USERS = DEMO_PROFILES;
