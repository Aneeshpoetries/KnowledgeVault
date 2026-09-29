'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
  };
}

export function AppShell({ children, user: propUser }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { user: authUser } = useAuth();

  const activeName = propUser?.name || authUser?.name || 'Admin User';
  const activeRole = propUser?.role || authUser?.role || 'ADMIN';
  const activeAvatar = propUser?.avatar || authUser?.avatar;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-dark text-vault-text antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        userName={activeName}
        userRole={activeRole}
        userAvatar={activeAvatar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          userName={activeName}
          userRole={activeRole}
          userAvatar={activeAvatar}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
