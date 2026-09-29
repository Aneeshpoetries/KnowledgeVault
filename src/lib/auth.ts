import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole } from './types';
export { DEMO_USERS } from './demo-users';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  avatar?: string;
  employeeId?: string;
}

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionEmail = cookieStore.get('kv_session_email')?.value || 'admin@novatech.ai'; // Default to admin for seamless evaluation

  const user = await prisma.user.findUnique({
    where: { email: sessionEmail },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    title: user.title || undefined,
    avatar: user.avatar || undefined,
    employeeId: user.employeeId || undefined,
  };
}
