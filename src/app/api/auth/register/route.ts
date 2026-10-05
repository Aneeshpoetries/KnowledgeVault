import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAudit, signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, title, department, companySlug } = body as {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
      title?: string;
      department?: string;
      companySlug?: string;
    };

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // 1. Try MongoDB (primary)
    try {
      const { mongoRegister, setSessionCookie } = await import('@/lib/mongo-auth');
      const result = await mongoRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        title,
        department,
        companySlug,
      });

      if (!('error' in result)) {
        const { user, token } = result;
        await setSessionCookie(token);
        
        const userRole = user.role as UserRole;
        const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE;

        return NextResponse.json(
          {
            success: true,
            user: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: userRole,
              title: user.title || 'Team Member',
              avatar: user.avatar,
              department: user.department || 'Core Engineering',
              permissions,
              isDemo: false,
            },
          },
          { status: 201 }
        );
      }
    } catch (e) {
      // MongoDB unavailable — fall through to Prisma
    }

    // 2. Fallback: Prisma SQLite
    const targetEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: { email: targetEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role || 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        email: targetEmail,
        name: name.trim(),
        passwordHash,
        role: userRole,
        employee: {
          create: {
            name: name.trim(),
            email: targetEmail,
            role: title || 'Team Member',
            department: department || 'Engineering',
            joinedDate: new Date(),
          }
        }
      },
      include: {
        employee: true
      }
    });

    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.EMPLOYEE;
    const token = signSessionToken({ userId: user.id, email: user.email, role: userRole });
    const cookieStore = await cookies();
    
    cookieStore.set('vault_session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('kv_session_email', user.email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        title: user.title || user.employee?.role || 'Team Member',
        avatar: user.avatar || user.employee?.avatar || undefined,
        department: user.employee?.department || 'Core Engineering',
        permissions,
        employeeId: user.employeeId,
        isDemo: false,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
