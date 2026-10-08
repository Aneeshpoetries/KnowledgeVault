'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  user?: { name?: string; role?: string; avatar?: string };
}

const ShellContext = createContext(false);
const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password'];

// Kept above the page boundary so navigation preserves the workspace and its data.
export function WorkspaceRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_ROUTES.includes(pathname)) return <>{children}</>;
  return <WorkspaceShell>{children}</WorkspaceShell>;
}

export function AppShell({ children, user: propUser }: AppShellProps) {
  const insideShell = useContext(ShellContext);
  if (insideShell) return <>{children}</>;
  return <WorkspaceShell user={propUser}>{children}</WorkspaceShell>;
}

function WorkspaceShell({ children, user: propUser }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { user: authUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => { contentRef.current?.scrollTo({ top: 0 }); }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setCommandPaletteOpen(open => !open);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isLoading && !authUser) router.replace('/login');
  }, [isLoading, authUser, router]);

  if (isLoading && !authUser) {
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
    <div className="app-shell flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-text antialiased selection:bg-[#C8A2F9]/30 selection:text-[#D7B7FF]">
      <a href="#workspace-content" className="kv-skip-link">Skip to content</a>
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
        <main ref={contentRef} id="workspace-content" tabIndex={-1} className="app-content flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          <div key={pathname} className="kv-page-transition max-w-7xl mx-auto">
            <ShellContext.Provider value={true}>{children}</ShellContext.Provider>
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
