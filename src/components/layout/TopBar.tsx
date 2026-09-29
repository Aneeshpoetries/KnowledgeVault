'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export function TopBar({
  onOpenCommandPalette,
  userName = 'Admin User',
  userRole = 'ADMIN',
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

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
  }, []);

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

      {/* Center: Global Command Search Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-vault-dark border border-vault-border hover:border-vault-border/90 text-xs text-vault-muted transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-vault-dim group-hover:text-vault-text transition-colors" />
            <span className="font-normal truncate">Search knowledge, people, projects...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-vault-dim bg-vault-surface border border-vault-border">
            <Command className="w-2.5 h-2.5 mr-0.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* AI Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vault-dark border border-vault-border text-[11px] text-vault-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-vault-text">Knowledge AI Online</span>
        </div>

        {/* Workspace Switcher */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors cursor-pointer">
          <span className="truncate max-w-[120px]">NovaTech Systems</span>
          <ChevronDown className="w-3 h-3 text-vault-dim" />
        </div>

        {/* Quick Theme Switcher */}
        <button
          type="button"
          onClick={cycleTheme}
          className="p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors flex items-center justify-center"
          title={`Appearance: ${theme.toUpperCase()} (${resolvedTheme} active) — Click to cycle Light/Dark/System`}
          aria-label="Toggle visual theme"
        >
          {theme === 'system' ? (
            <Laptop className="w-4 h-4 text-cyan-400" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
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

        {/* User Avatar */}
        <Link
          href="/login"
          className="flex items-center gap-2 pl-2 border-l border-vault-border/60 hover:opacity-80 transition-opacity"
          title="Switch User Persona"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[11px] font-semibold text-indigo-300">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}
