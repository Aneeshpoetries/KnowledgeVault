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
} from '@/components/ui/icons';
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

export function TopBar({ onOpenCommandPalette, userName: propName, userRole: propRole }: TopBarProps) {
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
    if (!authUser) return;
    if (authUser?.id?.startsWith('demo-')) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [currentRole, authUser?.id]);

  useEffect(() => {
    function dismiss(event: KeyboardEvent) { if (event.key === 'Escape') { setRoleMenuOpen(false); setNotificationsOpen(false); } }
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, []);

  const markAllRead = async () => {
    if (authUser?.id?.startsWith('demo-')) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
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
    if (targetRole === currentRole) { setRoleMenuOpen(false); return; }
    setSwitching(true);
    try { await switchRole(targetRole); }
    finally { setSwitching(false); setRoleMenuOpen(false); }
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return ['KnowledgeVault', 'Overview'];
    return ['KnowledgeVault', ...segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))];
  };

  const breadcrumbs = getBreadcrumbs();

  const getRoleAccent = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':        return { bg: 'bg-[#462146]', text: 'text-[#FF89C7]', pill: 'badge-role-admin' };
      case 'MANAGER':      return { bg: 'bg-[#262958]', text: 'text-[#93C8FF]', pill: 'badge-role-manager' };
      case 'EMPLOYEE':     return { bg: 'bg-[#3D245B]', text: 'text-[#D7B7FF]', pill: 'badge-role-emp' };
      case 'NEW_EMPLOYEE': return { bg: 'bg-[#482342]', text: 'text-[#FFB782]', pill: 'badge-role-new' };
    }
  };

  const activeColors = getRoleAccent(currentRole);

  return (
    <header className="vault-topbar h-14 border-b border-vault-border bg-vault-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-vault-dim">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="opacity-30 text-vault-muted">/</span>}
            <span
              className={`truncate max-w-[140px] ${
                idx === breadcrumbs.length - 1
                  ? 'text-vault-text font-semibold'
                  : 'hover:text-vault-muted transition-colors'
              }`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs text-vault-muted bg-vault-subtle hover:text-vault-text border border-vault-border transition-all"
          title="Search Knowledge & Actions (Cmd+K)"
          aria-label="Search knowledge and actions"
        >
          <Search className="w-3.5 h-3.5 text-vault-dim" />
          <span className="hidden sm:inline text-[12px]">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-vault-dim bg-vault-subtle border border-vault-border rounded-lg">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors border border-transparent hover:border-vault-border"
          title={`Theme: ${theme}`}
          aria-label={`Change theme, currently ${theme}`}
        >
          {theme === 'system' ? (
            <Laptop className="w-4 h-4" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-[#C69AFF]" />
          ) : (
            <Sun className="w-4 h-4 text-[#F7D480]" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications" aria-expanded={notificationsOpen}
            className="relative p-2 rounded-xl text-vault-muted hover:text-vault-text hover:bg-vault-subtle border border-transparent hover:border-vault-border transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#492047]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-24px))] bg-vault-surface border border-vault-border rounded-3xl shadow-elevated overflow-hidden z-50 animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-vault-border">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-vault-text">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B234A] text-[#F7D480]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-vault-muted hover:text-vault-text">
                      Mark all read
                    </button>
                  )}
                  <button aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} className="text-vault-dim hover:text-vault-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-vault-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-vault-dim">No new continuity notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs flex items-start gap-2.5 hover:bg-vault-subtle transition-colors ${!n.read ? 'bg-[#F8D4A7]/20' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'CRITICAL' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-[#FF75BF]" />
                        ) : n.type === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#FFB782]" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-vault-text truncate">{n.title}</p>
                        <p className="text-[11px] text-vault-muted mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            aria-label="Switch demo persona" aria-expanded={roleMenuOpen}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl border border-vault-border hover:bg-vault-subtle transition-all bg-vault-surface"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${activeColors.bg}`}>
              {currentName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[12px] font-semibold text-vault-text truncate max-w-[90px]">
                {currentName.split(' ')[0]}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${activeColors.pill}`}>
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-vault-dim" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-vault-surface border border-vault-border rounded-3xl shadow-elevated overflow-hidden z-50 animate-slide-in">
              <div className="px-4 py-3 border-b border-vault-border flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-vault-text block">Switch Workspace Role</span>
                  <span className="text-[11px] text-vault-dim">Test RBAC & permission isolation</span>
                </div>
                {switching && <span className="text-[10px] text-vault-muted animate-pulse">Switching...</span>}
              </div>

              <div className="p-2 space-y-1">
                {DEMO_PROFILES.map((profile) => {
                  const isSelected = profile.role === currentRole;
                  const colors = getRoleAccent(profile.role);
                  return (
                    <button
                      key={profile.role}
                      onClick={() => handleSelectRole(profile.role)}
                      disabled={switching}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-2xl text-left transition-all ${
                        isSelected ? 'bg-vault-subtle border border-vault-border' : 'hover:bg-vault-subtle border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${colors.bg}`}>
                        {profile.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-vault-text truncate">{profile.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${colors.pill}`}>
                            {profile.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-vault-dim truncate mt-0.5">{profile.title}</p>
                        {profile.name.includes('Rahul') && (
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F8BFA5]/30 text-[#FFB782] mt-1">
                            EXIT PENDING
                          </span>
                        )}
                        {profile.name.includes('Alex') && (
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C8A2F9]/30 text-[#D7B7FF] mt-1">
                            NEW HIRE
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-vault-muted shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 border-t border-vault-border flex items-center justify-between">
                <Link
                  href="/login"
                  onClick={() => setRoleMenuOpen(false)}
                  className="text-[11px] text-vault-muted hover:text-vault-text transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3" />
                  All credentials
                </Link>
                <button
                  onClick={() => { setRoleMenuOpen(false); logout(); }}
                  className="text-[11px] text-[#FF75BF] hover:text-[#e07090] transition-colors flex items-center gap-1"
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
