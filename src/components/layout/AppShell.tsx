'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../ui/CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-vault-dark text-vault-text antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        userName={user?.name || 'Admin User'}
        userRole={user?.role || 'ADMIN'}
        userAvatar={user?.avatar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          userName={user?.name || 'Admin User'}
          userRole={user?.role || 'ADMIN'}
          userAvatar={user?.avatar}
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
