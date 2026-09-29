import { UserRole } from './types';

export const DEMO_USERS: Record<UserRole, { email: string; label: string; role: UserRole; desc: string }> = {
  ADMIN: {
    email: 'admin@novatech.ai',
    label: 'VP of Engineering (Admin)',
    role: 'ADMIN',
    desc: 'Full governance, AI configuration, knowledge verification, and security control.',
  },
  MANAGER: {
    email: 'manager@novatech.ai',
    label: 'Sarah Chen (Manager)',
    role: 'MANAGER',
    desc: 'Team coverage monitoring, knowledge gap resolution, and exit interview oversight.',
  },
  EMPLOYEE: {
    email: 'rahul@novatech.ai',
    label: 'Rahul Sharma (Senior Employee)',
    role: 'EMPLOYEE',
    desc: 'Core payment architect holding 73% tacit operational knowledge.',
  },
  NEW_EMPLOYEE: {
    email: 'newhire@novatech.ai',
    label: 'Alex Rivera (New Hire)',
    role: 'NEW_EMPLOYEE',
    desc: 'Context rebuild mode, asking AI questions and exploring runbooks.',
  },
};
