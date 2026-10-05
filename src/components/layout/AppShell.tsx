'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  user?: { name?: string; role?: string; avatar?: string };
}

export function AppShell({ children, user: propUser }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user: authUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !authUser) router.replace('/login');
  }, [isMounted, isLoading, authUser, router]);

  if (!isMounted || isLoading) {
    return (
      <div suppressHydrationWarning className="flex h-screen w-screen items-center justify-center bg-vault-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-vault-text flex items-center justify-center shadow-card animate-pulse">
            <div className="w-6 h-6 rounded-full bg-vault-dark/50" />
          </div>
          <p className="text-[12px] text-vault-dim font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!authUser) return null;

  const activeName   = propUser?.name   || authUser?.name   || 'Admin User';
  const activeRole   = propUser?.role   || authUser?.role   || 'ADMIN';
  const activeAvatar = propUser?.avatar || authUser?.avatar;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-text antialiased selection:bg-[#C8A2F9]/30 selection:text-[#4a1a8b]">
      {/* Sidebar */}
      <Sidebar userName={activeName} userRole={activeRole} userAvatar={activeAvatar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          userName={activeName}
          userRole={activeRole}
          userAvatar={activeAvatar}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <MobileNav />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
