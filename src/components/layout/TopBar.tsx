'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Command,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  X,
  Moon,
  Sun,
  Laptop,
  Check,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { DEMO_PROFILES } from '@/lib/demo-users';
import { UserRole } from '@/lib/types';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export function TopBar({
  onOpenCommandPalette,
  userName: propName,
  userRole: propRole,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user: authUser, switchRole, logout } = useAuth();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [switching, setSwitching] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);

  const currentRole = (authUser?.role || propRole || 'ADMIN') as UserRole;
  const currentName = authUser?.name || propName || 'User';

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [currentRole]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleSelectRole = async (targetRole: UserRole) => {
    if (targetRole === currentRole) {
      setRoleMenuOpen(false);
      return;
    }
    setSwitching(true);
    try {
      await switchRole(targetRole);
    } finally {
      setSwitching(false);
      setRoleMenuOpen(false);
    }
  };

  // Generate clean breadcrumb labels
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return ['KnowledgeVault', 'Overview'];
    return [
      'KnowledgeVault',
      ...segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          avatar: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'MANAGER':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          avatar: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'EMPLOYEE':
        return {
          pill: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          avatar: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'NEW_EMPLOYEE':
        return {
          pill: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          avatar: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
    }
  };

  const activeColors = getRoleColor(currentRole);

  return (
    <header className="h-14 border-b border-vault-border bg-vault-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-vault-dim">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="opacity-40">/</span>}
            <span
              className={`truncate max-w-[140px] ${
                idx === breadcrumbs.length - 1
                  ? 'text-vault-text font-medium'
                  : 'hover:text-vault-muted transition-colors'
              }`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions, Search, Theme, Notifications, and Quick Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-vault-muted bg-vault-subtle hover:text-vault-text hover:bg-vault-border/50 border border-vault-border/60 transition-all shadow-sm"
          title="Search Knowledge & Actions (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-vault-dim" />
          <span className="hidden sm:inline">Search organizational memory...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-vault-dim bg-vault-dark border border-vault-border rounded">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
          title={`Theme: ${theme} (click to toggle)`}
          aria-label="Toggle color theme"
        >
          {theme === 'system' ? (
            <Laptop className="w-4 h-4" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-vault-surface border border-vault-border rounded-xl shadow-elevated overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-vault-border bg-vault-dark">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-vault-text">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-vault-dim hover:text-vault-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-vault-border/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-vault-dim">
                    No new continuity notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex items-start gap-2.5 hover:bg-vault-subtle transition-colors ${
                        !n.read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'CRITICAL' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        ) : n.type === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-vault-text truncate">{n.title}</p>
                        <p className="text-[11px] text-vault-muted mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md border border-vault-border hover:bg-vault-subtle transition-all"
            title="Switch Demo Role & Permissions"
            aria-label="Role selector"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border ${activeColors.avatar}`}
            >
              {currentName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-xs font-medium text-vault-text truncate max-w-[120px]">
                {currentName.split(' ')[0]}
              </span>
              <span
                className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase tracking-wider mt-0.5 inline-block ${activeColors.pill}`}
              >
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-vault-dim ml-0.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-vault-surface border border-vault-border rounded-xl shadow-elevated overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-vault-border bg-vault-dark flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-vault-text block">
                    Switch Workspace Role
                  </span>
                  <span className="text-[10px] text-vault-dim">
                    Test RBAC & permission isolation
                  </span>
                </div>
                {switching && (
                  <span className="text-[10px] font-mono text-indigo-400 animate-pulse">
                    Switching...
                  </span>
                )}
              </div>

              <div className="p-1.5 space-y-1">
                {DEMO_PROFILES.map((profile) => {
                  const isSelected = profile.role === currentRole;
                  const colors = getRoleColor(profile.role);

                  return (
                    <button
                      key={profile.role}
                      onClick={() => handleSelectRole(profile.role)}
                      disabled={switching}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-vault-subtle border border-vault-border'
                          : 'hover:bg-vault-subtle/50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border shrink-0 mt-0.5 ${colors.avatar}`}
                      >
                        {profile.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-vault-text truncate">
                            {profile.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase tracking-wider ${colors.pill}`}
                          >
                            {profile.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-vault-dim truncate mt-0.5">
                          {profile.title}
                        </p>
                        {profile.name.includes('Rahul') && (
                          <span className="inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-1">
                            EXIT PENDING
                          </span>
                        )}
                        {profile.name.includes('Alex') && (
                          <span className="inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-1">
                            NEW HIRE
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-vault-border/60 bg-vault-dark/40 flex items-center justify-between">
                <Link
                  href="/login"
                  onClick={() => setRoleMenuOpen(false)}
                  className="text-[11px] text-vault-dim hover:text-vault-text transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3" />
                  Explore all credentials
                </Link>
                <button
                  onClick={() => {
                    setRoleMenuOpen(false);
                    logout();
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
