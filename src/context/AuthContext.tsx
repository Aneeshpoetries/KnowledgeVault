'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { AuthUser, Permission, hasPermission as checkPermission, ROLE_PERMISSIONS } from '@/lib/rbac';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-users';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email?: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  demoProfiles: DemoProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Failed to load authenticated user session:', err);
      setError(err?.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email?: string, password?: string, role?: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole): Promise<boolean> => {
    const success = await login(undefined, undefined, role);
    if (success) {
      router.push('/dashboard');
    }
    return success;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const checkUserPermission = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(user, permission);
    },
    [user]
  );

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        switchRole,
        refreshUser,
        hasPermission: checkUserPermission,
        demoProfiles: DEMO_PROFILES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
