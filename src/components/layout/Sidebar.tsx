'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckSquare,
  PlusCircle,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { KnowledgeVaultLogo } from '../ui/KnowledgeVaultLogo';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
}

export function Sidebar({ userRole: propRole, userName: propName, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);

  const role: UserRole = (authUser?.role || propRole || 'ADMIN') as UserRole;
  const name = authUser?.name || propName || 'User';

  // Fetch pending reviews count for Admin and Manager
  useEffect(() => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.items)) {
            setPendingReviewCount(data.items.length);
          }
        })
        .catch(() => {});
    }
  }, [role]);

  // Role-specific navigation items
  const getNavSections = () => {
    if (role === 'ADMIN') {
      return {
        primary: [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Knowledge Base', href: '/knowledge', icon: Brain },
          {
            label: 'Review Queue',
            href: '/reviews',
            icon: CheckSquare,
            badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined,
          },
          { label: 'Continuity AI', href: '/assistant', icon: Bot, isAi: true },
          { label: 'Knowledge Graph', href: '/graph', icon: Network },
          { label: 'Risk & Coverage', href: '/coverage', icon: PieChart },
          { label: 'Continuity Gaps', href: '/gaps', icon: ShieldAlert, hasDot: true },
        ],
        workspaceTitle: 'Governance',
        workspace: [
          { label: 'Employees', href: '/employees', icon: Users },
          { label: 'Projects', href: '/projects', icon: FolderGit2 },
          { label: 'Sources', href: '/sources', icon: Layers },
          { label: 'Exit Mode', href: '/exit-mode', icon: LogOut, isAccent: true },
        ],
      };
    }

    if (role === 'MANAGER') {
      return {
        primary: [
          { label: 'Team Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Knowledge Base', href: '/knowledge', icon: Brain },
          {
            label: 'Review Queue',
            href: '/reviews',
            icon: CheckSquare,
            badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined,
          },
          { label: 'Continuity AI', href: '/assistant', icon: Bot, isAi: true },
          { label: 'Team Graph', href: '/graph', icon: Network },
          { label: 'Team Coverage', href: '/coverage', icon: PieChart },
          { label: 'Team Gaps', href: '/gaps', icon: ShieldAlert, hasDot: true },
        ],
        workspaceTitle: 'Team Workspace',
        workspace: [
          { label: 'Direct Reports', href: '/employees', icon: Users },
          { label: 'Projects', href: '/projects', icon: FolderGit2 },
          { label: 'Exit Mode', href: '/exit-mode', icon: LogOut, isAccent: true },
        ],
      };
    }

    if (role === 'EMPLOYEE') {
      return {
        primary: [
          { label: 'My Knowledge', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Browse Records', href: '/knowledge', icon: Brain },
          { label: 'Submit Knowledge', href: '/knowledge/new', icon: PlusCircle },
          { label: 'Continuity AI', href: '/assistant', icon: Bot, isAi: true },
          { label: 'Architecture Graph', href: '/graph', icon: Network },
          { label: 'Personal Coverage', href: '/coverage', icon: PieChart },
        ],
        workspaceTitle: 'My Workspace',
        workspace: [
          { label: 'My Projects', href: '/projects', icon: FolderGit2 },
          { label: 'Exit Mode Transfer', href: '/exit-mode', icon: LogOut, isAccent: true },
        ],
      };
    }

    // NEW_EMPLOYEE
    return {
      primary: [
        { label: 'Getting Started', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Onboarding Guides', href: '/knowledge', icon: BookOpen },
        { label: 'Ask Nova AI', href: '/assistant', icon: Bot, isAi: true },
      ],
      workspaceTitle: 'My Project',
      workspace: [
        { label: 'Checkout & Payments', href: '/projects', icon: FolderGit2 },
        { label: 'Team Directory', href: '/employees', icon: Users },
      ],
    };
  };

  const { primary, workspaceTitle, workspace } = getNavSections();

  const handleResetDemo = async () => {
    if (!confirm('Re-seed database with original NovaTech enterprise demo dataset?')) return;
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

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MANAGER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EMPLOYEE':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'NEW_EMPLOYEE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-vault-subtle text-vault-muted border-vault-border';
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
          {primary.map((item: any) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

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

                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}

                {!collapsed && item.hasDot && (
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

          {/* Section: Workspace / Governance */}
          <div className="pt-3 pb-1 px-2.5">
            {!collapsed ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                {workspaceTitle}
              </span>
            ) : (
              <div className="h-[1px] bg-vault-border/60 my-1" />
            )}
          </div>

          {workspace.map((item: any) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? item.isAccent
                      ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                      : 'text-vault-text bg-vault-border/60'
                    : item.isAccent
                    ? 'text-vault-muted hover:text-amber-300 hover:bg-vault-subtle/50'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span
                    className={`absolute left-0 top-1 bottom-1 w-[2px] rounded-full ${
                      item.isAccent ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? item.isAccent
                        ? 'text-amber-400'
                        : 'text-vault-text'
                      : item.isAccent
                      ? 'text-vault-dim group-hover:text-amber-400'
                      : 'text-vault-dim group-hover:text-vault-text'
                  }`}
                />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.isAccent && role !== 'NEW_EMPLOYEE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls: Settings, Reset Demo, User Persona */}
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

        {role === 'ADMIN' && (
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
        )}

        {/* User Persona & Role Card */}
        <div className="pt-2">
          <div
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-vault-dark/40 border border-vault-border/40"
            title={`${name} (${role})`}
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-semibold text-indigo-300 shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 leading-none">
                <span className="text-xs font-medium text-vault-text truncate">{name}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase tracking-wider ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role.replace('_', ' ')}
                  </span>
                  {name.includes('Rahul') && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      EXIT PENDING
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
