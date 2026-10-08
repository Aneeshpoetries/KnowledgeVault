import { UserRole } from './types';
import { Prisma } from '@prisma/client';

export type Permission =
  | 'VIEW_ORGANIZATION'
  | 'VIEW_TEAM'
  | 'VIEW_OWN_DATA'
  | 'VIEW_ALL_KNOWLEDGE'
  | 'VIEW_TEAM_KNOWLEDGE'
  | 'VIEW_PROJECT_KNOWLEDGE'
  | 'VIEW_ASSIGNED_KNOWLEDGE'
  | 'CREATE_KNOWLEDGE'
  | 'EDIT_KNOWLEDGE'
  | 'DELETE_KNOWLEDGE'
  | 'APPROVE_KNOWLEDGE'
  | 'VERIFY_KNOWLEDGE'
  | 'VIEW_ALL_EMPLOYEES'
  | 'VIEW_TEAM_EMPLOYEES'
  | 'VIEW_ALL_PROJECTS'
  | 'MANAGE_PROJECTS'
  | 'VIEW_ORGANIZATION_COVERAGE'
  | 'VIEW_TEAM_COVERAGE'
  | 'VIEW_PERSONAL_COVERAGE'
  | 'VIEW_ALL_GAPS'
  | 'VIEW_TEAM_GAPS'
  | 'VIEW_PERSONAL_GAPS'
  | 'VIEW_FULL_GRAPH'
  | 'VIEW_TEAM_GRAPH'
  | 'VIEW_PROJECT_GRAPH'
  | 'START_EXIT_MODE'
  | 'PARTICIPATE_EXIT_MODE'
  | 'VIEW_EXIT_REPORT'
  | 'MANAGE_USERS'
  | 'MANAGE_ROLES'
  | 'MANAGE_AI_SETTINGS'
  | 'VIEW_AUDIT_LOG';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  avatar?: string;
  employeeId?: string;
  department?: string;
  teamId?: string;
  managerId?: string;
  directReportIds: string[];
  projectIds: string[];
  permissions: Permission[];
  isDemo?: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'VIEW_ORGANIZATION',
    'VIEW_TEAM',
    'VIEW_OWN_DATA',
    'VIEW_ALL_KNOWLEDGE',
    'VIEW_TEAM_KNOWLEDGE',
    'VIEW_PROJECT_KNOWLEDGE',
    'VIEW_ASSIGNED_KNOWLEDGE',
    'CREATE_KNOWLEDGE',
    'EDIT_KNOWLEDGE',
    'DELETE_KNOWLEDGE',
    'APPROVE_KNOWLEDGE',
    'VERIFY_KNOWLEDGE',
    'VIEW_ALL_EMPLOYEES',
    'VIEW_TEAM_EMPLOYEES',
    'VIEW_ALL_PROJECTS',
    'MANAGE_PROJECTS',
    'VIEW_ORGANIZATION_COVERAGE',
    'VIEW_TEAM_COVERAGE',
    'VIEW_PERSONAL_COVERAGE',
    'VIEW_ALL_GAPS',
    'VIEW_TEAM_GAPS',
    'VIEW_PERSONAL_GAPS',
    'VIEW_FULL_GRAPH',
    'VIEW_TEAM_GRAPH',
    'VIEW_PROJECT_GRAPH',
    'START_EXIT_MODE',
    'PARTICIPATE_EXIT_MODE',
    'VIEW_EXIT_REPORT',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_AI_SETTINGS',
    'VIEW_AUDIT_LOG',
  ],
  MANAGER: [
    'VIEW_TEAM',
    'VIEW_OWN_DATA',
    'VIEW_TEAM_KNOWLEDGE',
    'VIEW_PROJECT_KNOWLEDGE',
    'VIEW_ASSIGNED_KNOWLEDGE',
    'CREATE_KNOWLEDGE',
    'EDIT_KNOWLEDGE',
    'DELETE_KNOWLEDGE',
    'APPROVE_KNOWLEDGE',
    'VERIFY_KNOWLEDGE',
    'VIEW_TEAM_EMPLOYEES',
    'VIEW_TEAM_COVERAGE',
    'VIEW_PERSONAL_COVERAGE',
    'VIEW_TEAM_GAPS',
    'VIEW_PERSONAL_GAPS',
    'VIEW_TEAM_GRAPH',
    'VIEW_PROJECT_GRAPH',
    'START_EXIT_MODE',
    'PARTICIPATE_EXIT_MODE',
    'VIEW_EXIT_REPORT',
  ],
  EMPLOYEE: [
    'VIEW_OWN_DATA',
    'VIEW_PROJECT_KNOWLEDGE',
    'VIEW_ASSIGNED_KNOWLEDGE',
    'CREATE_KNOWLEDGE',
    'EDIT_KNOWLEDGE',
    'VERIFY_KNOWLEDGE',
    'VIEW_PERSONAL_COVERAGE',
    'VIEW_PERSONAL_GAPS',
    'VIEW_PROJECT_GRAPH',
    'PARTICIPATE_EXIT_MODE',
  ],
  NEW_EMPLOYEE: [
    'VIEW_OWN_DATA',
    'VIEW_PROJECT_KNOWLEDGE',
    'VIEW_ASSIGNED_KNOWLEDGE',
    'VIEW_PERSONAL_COVERAGE',
    'VIEW_PERSONAL_GAPS',
    'VIEW_PROJECT_GRAPH',
  ],
};

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Builds the Prisma `where` clause for querying KnowledgeItems based on the user's role and data-level scope.
 * This runs at the database query level so unauthorized items are NEVER returned.
 */
export function buildAccessibleKnowledgeWhere(user: AuthUser): Prisma.KnowledgeItemWhereInput {
  if (user.role === 'ADMIN') {
    return {}; // Full organization access
  }

  const directReportIds = user.directReportIds || [];
  const projectIds = user.projectIds || [];
  const employeeId = user.employeeId || 'none';

  if (user.role === 'MANAGER') {
    return {
      OR: [
        // 1. Approved or Verified knowledge in department or assigned projects
        {
          status: { in: ['APPROVED', 'VERIFIED'] },
          OR: [
            { visibility: 'PUBLIC' },
            { visibility: 'TEAM', employee: { department: user.department || '' } },
            { visibility: 'PROJECT', projectId: { in: projectIds } },
            { employeeId: { in: [employeeId, ...directReportIds] } },
          ],
        },
        // 2. Pending review items submitted by their direct reports (approval queue)
        {
          status: { in: ['PENDING_REVIEW', 'NEEDS_REVISION'] },
          OR: [
            { employeeId: { in: directReportIds } },
            { createdByEmployeeId: { in: directReportIds } },
          ],
        },
        // 3. Manager's own draft / pending knowledge
        {
          OR: [
            { employeeId },
            { createdByEmployeeId: employeeId },
          ],
        },
      ],
      // Always exclude RESTRICTED executive-only knowledge
      NOT: {
        visibility: 'RESTRICTED',
      },
    };
  }

  if (user.role === 'EMPLOYEE') {
    return {
      OR: [
        // 1. Employee's own contributions (any status including DRAFT, PENDING_REVIEW)
        { employeeId },
        { createdByEmployeeId: employeeId },
        // 2. Approved or Verified team/project/public knowledge
        {
          status: { in: ['APPROVED', 'VERIFIED'] },
          OR: [
            { visibility: 'PUBLIC' },
            { visibility: 'PROJECT', projectId: { in: projectIds } },
            { visibility: 'TEAM', employee: { department: user.department || '' } },
          ],
          NOT: {
            visibility: { in: ['RESTRICTED', 'PRIVATE'] },
          },
        },
      ],
    };
  }

  // NEW_EMPLOYEE: Only approved public & assigned project onboarding knowledge
  return {
    status: { in: ['APPROVED', 'VERIFIED'] },
    OR: [
      { visibility: 'PUBLIC' },
      { visibility: 'PROJECT', projectId: { in: projectIds } },
    ],
    NOT: {
      visibility: { in: ['RESTRICTED', 'PRIVATE'] },
    },
  };
}

/**
 * Checks whether an authenticated user is permitted to view a specific single knowledge item.
 */
export function canAccessKnowledgeItem(user: AuthUser, item: any): boolean {
  if (user.role === 'ADMIN') return true;

  // Executive restricted knowledge
  if (item.visibility === 'RESTRICTED') return false;

  const isOwnerOrCreator =
    (user.employeeId && item.employeeId === user.employeeId) ||
    (user.employeeId && item.createdByEmployeeId === user.employeeId);

  if (isOwnerOrCreator) return true;

  const isDirectReportItem =
    user.directReportIds.length > 0 &&
    (user.directReportIds.includes(item.employeeId) ||
      user.directReportIds.includes(item.createdByEmployeeId));

  if (user.role === 'MANAGER') {
    if (isDirectReportItem) return true;
    if (item.status === 'APPROVED' || item.status === 'VERIFIED') {
      if (item.visibility === 'PUBLIC') return true;
      if (item.projectId && user.projectIds.includes(item.projectId)) return true;
      if (item.employee?.department === user.department) return true;
    }
    return false;
  }

  if (user.role === 'EMPLOYEE') {
    if (item.status === 'APPROVED' || item.status === 'VERIFIED') {
      if (item.visibility === 'PUBLIC') return true;
      if (item.projectId && user.projectIds.includes(item.projectId)) return true;
    }
    return false;
  }

  if (user.role === 'NEW_EMPLOYEE') {
    if (item.status === 'APPROVED' || item.status === 'VERIFIED') {
      if (item.visibility === 'PUBLIC') return true;
      if (item.projectId && user.projectIds.includes(item.projectId)) return true;
    }
    return false;
  }

  return false;
}
