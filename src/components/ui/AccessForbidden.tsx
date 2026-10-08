'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, UserCheck } from '@/components/ui/icons';
import { useAuth } from '@/context/AuthContext';

interface AccessForbiddenProps {
  title?: string;
  message?: string;
  requiredRole?: string;
}

export function AccessForbidden({
  title = 'Access Restricted',
  message = 'This knowledge is outside your workspace.',
  requiredRole,
}: AccessForbiddenProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full p-8 rounded-2xl bg-vault-surface border border-vault-border text-center space-y-5 shadow-elevated">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-lg font-semibold text-vault-text mt-2">{title}</h2>
          <p className="text-xs text-vault-muted leading-relaxed">{message}</p>
        </div>

        <div className="p-3 rounded-lg bg-vault-dark border border-vault-border text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between text-vault-dim text-[11px]">
            <span>Current Role:</span>
            <span className="font-mono text-vault-text">{user?.role || 'Guest'}</span>
          </div>
          {requiredRole && (
            <div className="flex items-center justify-between text-vault-dim text-[11px]">
              <span>Required Role:</span>
              <span className="font-mono text-indigo-400">{requiredRole}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-vault-dim text-[11px]">
            <span>Security Policy:</span>
            <span className="font-mono text-emerald-400">Strict RBAC</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-vault-subtle hover:bg-vault-border text-xs font-medium text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Switch Persona
          </Link>
        </div>
      </div>
    </div>
  );
}
