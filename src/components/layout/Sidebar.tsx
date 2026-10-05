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

  useEffect(() => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.items)) setPendingReviewCount(data.items.length);
        })
        .catch(() => {});
    }
  }, [role]);

  const getNavSections = () => {
    if (role === 'ADMIN') {
      return {
        primary: [
          { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Knowledge Base', href: '/knowledge', icon: Brain },
          { label: 'Review Queue', href: '/reviews', icon: CheckSquare, badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined },
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
          { label: 'Review Queue', href: '/reviews', icon: CheckSquare, badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined },
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
      if (res.ok) window.location.reload();
    } catch {
      alert('Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  const getRoleBadgeClass = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':       return 'badge-role-admin';
      case 'MANAGER':     return 'badge-role-manager';
      case 'EMPLOYEE':    return 'badge-role-emp';
      case 'NEW_EMPLOYEE':return 'badge-role-new';
      default:            return 'badge-role-emp';
    }
  };

  const getRoleAccentColor = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':       return 'bg-[#FCA8CA]';
      case 'MANAGER':     return 'bg-[#A0C4F6]';
      case 'EMPLOYEE':    return 'bg-[#C8A2F9]';
      case 'NEW_EMPLOYEE':return 'bg-[#F8BFA5]';
      default:            return 'bg-[#C8A2F9]';
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen border-r border-vault-border bg-vault-surface transition-all duration-200 z-30 select-none shadow-card ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-vault-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-2xl bg-vault-text flex items-center justify-center shrink-0 text-vault-dark shadow-sm">
              <KnowledgeVaultLogo size={16} />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-bold text-[13px] tracking-tight text-vault-text truncate">
                  KnowledgeVault
                </span>
                <span className="text-[10px] text-vault-dim mt-0.5">
                  Continuity Engine
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-vault-dim hover:text-vault-text hover:bg-vault-subtle transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-0.5 mt-1">
          {primary.map((item: any) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-vault-text' : 'text-vault-dim'
                  }`}
                />
                {!collapsed && <span className="flex-1 truncate text-[13px]">{item.label}</span>}

                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#F8D4A7] text-[#7a5510]">
                    {item.badge}
                  </span>
                )}
                {!collapsed && item.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F8BFA5] shrink-0" />
                )}
                {!collapsed && item.isAi && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C8A2F9]/20 text-[#7C6AF7]">
                    AI
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section Divider */}
          <div className="pt-4 pb-1 px-3">
            {!collapsed ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-vault-dim">
                {workspaceTitle}
              </span>
            ) : (
              <div className="h-[1px] bg-vault-border" />
            )}
          </div>

          {workspace.map((item: any) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${
                  item.isAccent && !isActive ? 'hover:text-[#F391AC]' : ''
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.isAccent
                      ? isActive ? 'text-[#F391AC]' : 'text-vault-dim group-hover:text-[#F391AC]'
                      : isActive ? 'text-vault-text' : 'text-vault-dim'
                  }`}
                />
                {!collapsed && <span className="flex-1 truncate text-[13px]">{item.label}</span>}
                {!collapsed && item.isAccent && role !== 'NEW_EMPLOYEE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F391AC] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Settings + User */}
      <div className="p-3 border-t border-vault-border space-y-1">
        <Link
          href="/settings"
          className={`sidebar-nav-item ${pathname === '/settings' ? 'active' : ''}`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0 text-vault-dim" />
          {!collapsed && <span className="flex-1 truncate text-[13px]">Settings</span>}
        </Link>

        {role === 'ADMIN' && (
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={resetting}
            className="sidebar-nav-item w-full text-left"
            title={collapsed ? 'Reset Demo Data' : undefined}
          >
            <RotateCcw className={`w-4 h-4 shrink-0 text-vault-dim ${resetting ? 'animate-spin' : ''}`} />
            {!collapsed && (
              <span className="flex-1 truncate text-[13px]">{resetting ? 'Resetting...' : 'Reset Demo'}</span>
            )}
          </button>
        )}

        {/* User Card */}
        <div className="pt-2">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-2xl bg-vault-subtle border border-vault-border">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${getRoleAccentColor(role)}`}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 leading-none">
                <span className="text-[12px] font-semibold text-vault-text truncate">{name}</span>
                <span className={`text-[9px] font-bold mt-1 uppercase tracking-wide px-1.5 py-0.5 rounded-full inline-block w-fit ${getRoleBadgeClass(role)}`}>
                  {role.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
