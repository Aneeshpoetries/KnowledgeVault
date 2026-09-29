import { UserRole } from './types';

export const DEMO_USERS: Record<
  UserRole,
  {
    name: string;
    email: string;
    label: string;
    role: UserRole;
    title: string;
    department: string;
    desc: string;
    accessLevel: string;
    scope: string;
    avatar: string;
  }
> = {
  ADMIN: {
    name: 'Marcus Vance',
    email: 'marcus@novatech.demo',
    label: 'Marcus Vance (Admin)',
    role: 'ADMIN',
    title: 'Engineering Director',
    department: 'Engineering Leadership',
    desc: 'Full organization governance, global risk analytics, AI configuration, and complete audit access.',
    accessLevel: 'Organization Administrator (Full Access)',
    scope: 'Entire Organization · All Employees · All Projects · Full Governance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  MANAGER: {
    name: 'Sarah Lin',
    email: 'sarah@novatech.demo',
    label: 'Sarah Lin (Manager)',
    role: 'MANAGER',
    title: 'Engineering Manager',
    department: 'Core Infrastructure & Payments',
    desc: 'Team coverage monitoring, knowledge approval queue, and departmental Exit Interview oversight.',
    accessLevel: 'Team Manager (Departmental Scope)',
    scope: 'Core Infrastructure Team · Assigned Projects · Knowledge Approval Queue',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
  EMPLOYEE: {
    name: 'Rahul Sharma',
    email: 'rahul@novatech.demo',
    label: 'Rahul Sharma (Employee - Exit Pending)',
    role: 'EMPLOYEE',
    title: 'Staff Infrastructure Engineer',
    department: 'Core Infrastructure & Payments',
    desc: 'Core payment architect holding 73% tacit operational knowledge. Departing in 2 weeks.',
    accessLevel: 'Staff Engineer (Exit Pending)',
    scope: 'Payment System · Personal Knowledge Holdings · Exit Knowledge Recovery',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  NEW_EMPLOYEE: {
    name: 'Alex Chen',
    email: 'alex@novatech.demo',
    label: 'Alex Chen (New Employee)',
    role: 'NEW_EMPLOYEE',
    title: 'Junior Developer',
    department: 'Core Infrastructure & Payments',
    desc: 'Onboarding ramp-up mode. Exploring approved documentation and asking AI guided questions.',
    accessLevel: 'Onboarding Developer (Learning Scope)',
    scope: 'Approved Documentation · Assigned Projects · Guided AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  },
};

export type DemoProfile = (typeof DEMO_USERS)[UserRole];

export const DEMO_PROFILES: DemoProfile[] = Object.values(DEMO_USERS);
