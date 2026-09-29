'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Bot,
  Network,
  PieChart,
  ShieldAlert,
  Users,
  FolderGit2,
  Layers,
  LogOut,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { KnowledgeVaultLogo } from '../ui/KnowledgeVaultLogo';

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
}

export function Sidebar({ userRole = 'ADMIN', userName = 'Admin User', userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [resetting, setResetting] = useState(false);

  const primaryNav = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Knowledge', href: '/knowledge', icon: Brain },
    { label: 'Assistant', href: '/assistant', icon: Bot, isAi: true },
    { label: 'Graph', href: '/graph', icon: Network },
    { label: 'Coverage', href: '/coverage', icon: PieChart },
    { label: 'Gaps', href: '/gaps', icon: ShieldAlert, hasBadge: true },
  ];

  const workspaceNav = [
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Sources', href: '/sources', icon: Layers },
  ];

  const handleResetDemo = async () => {
    if (!confirm('Re-seed the database with original NovaTech enterprise demo dataset?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      alert('Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen border-r border-vault-border bg-vault-surface transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-vault-border/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
              <KnowledgeVaultLogo size={16} />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-semibold text-xs tracking-tight text-vault-text">
                  KnowledgeVault
                </span>
                <span className="text-[10px] text-vault-dim mt-0.5 font-mono">
                  Continuity Engine
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-vault-dim hover:text-vault-text hover:bg-vault-border/50 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-2 space-y-0.5 mt-2">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'text-vault-text bg-vault-border/60'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Linear-style left active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-indigo-500" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? item.isAi
                        ? 'text-indigo-400'
                        : 'text-vault-text'
                      : 'text-vault-dim group-hover:text-vault-text'
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {!collapsed && item.hasBadge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {!collapsed && item.isAi && (
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    AI
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section: Workspace */}
          <div className="pt-3 pb-1 px-2.5">
            {!collapsed ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                Workspace
              </span>
            ) : (
              <div className="h-[1px] bg-vault-border/60 my-1" />
            )}
          </div>

          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'text-vault-text bg-vault-border/60'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-emerald-500" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-vault-text' : 'text-vault-dim group-hover:text-vault-text'
                  }`}
                />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Section: Exit Mode */}
          <div className="pt-3 pb-1 px-2.5">
            {!collapsed ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/80">
                Recovery
              </span>
            ) : (
              <div className="h-[1px] bg-vault-border/60 my-1" />
            )}
          </div>

          <Link
            href="/exit-mode"
            className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
              pathname.startsWith('/exit-mode')
                ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                : 'text-vault-muted hover:text-amber-300 hover:bg-vault-subtle/50'
            }`}
            title={collapsed ? 'Exit Mode' : undefined}
          >
            {pathname.startsWith('/exit-mode') && (
              <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-amber-400" />
            )}
            <LogOut
              className={`w-4 h-4 shrink-0 transition-colors ${
                pathname.startsWith('/exit-mode') ? 'text-amber-400' : 'text-vault-dim group-hover:text-amber-400'
              }`}
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Exit Mode</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </>
            )}
          </Link>
        </nav>
      </div>

      {/* Bottom controls: Settings, Reset Demo, User Profile */}
      <div className="p-2 border-t border-vault-border/60 space-y-0.5">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            pathname === '/settings'
              ? 'text-vault-text bg-vault-border/60'
              : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0 text-vault-dim" />
          {!collapsed && <span className="flex-1 truncate">Settings</span>}
        </Link>

        <button
          type="button"
          onClick={handleResetDemo}
          disabled={resetting}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-vault-dim hover:text-vault-text hover:bg-vault-subtle/50 transition-colors text-left"
          title={collapsed ? 'Reset Demo Data' : undefined}
        >
          <RotateCcw className={`w-4 h-4 shrink-0 ${resetting ? 'animate-spin' : ''}`} />
          {!collapsed && <span className="flex-1 truncate">{resetting ? 'Resetting...' : 'Reset Demo'}</span>}
        </button>

        {/* User Card */}
        <div className="pt-2">
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-vault-subtle/60 transition-colors"
            title="Switch demo persona"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-semibold text-indigo-300 shrink-0">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 leading-none">
                <span className="text-xs font-medium text-vault-text truncate">{userName}</span>
                <span className="text-[10px] font-mono text-vault-dim mt-0.5">{userRole}</span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
