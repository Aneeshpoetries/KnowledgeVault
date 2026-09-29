'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Briefcase,
  UserCheck,
  Sparkles,
  ArrowRight,
  User,
  ChevronRight,
} from 'lucide-react';
import { DEMO_USERS } from '@/lib/demo-users';
import { UserRole } from '@/lib/types';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

export default function LoginPage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('Authentication failed');
      }
    } catch {
      alert('Authentication network error');
    } finally {
      setLoadingRole(null);
    }
  };

  const roleIcons: Record<UserRole, any> = {
    ADMIN: ShieldCheck,
    MANAGER: Briefcase,
    EMPLOYEE: UserCheck,
    NEW_EMPLOYEE: Sparkles,
  };

  return (
    <div className="min-h-screen bg-vault-dark text-vault-text flex items-center justify-center p-6 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 items-center justify-center text-indigo-400 mb-2">
            <KnowledgeVaultLogo size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-vault-text tracking-tight">
            KnowledgeVault AI
          </h1>
          <p className="text-xs sm:text-sm text-vault-muted max-w-sm mx-auto">
            Select a verified persona to evaluate organizational memory, continuity diagnostics, and Exit Mode.
          </p>
        </div>

        {/* Personas 4-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
            const userDef = DEMO_USERS[roleKey];
            const Icon = roleIcons[roleKey];
            const isLoading = loadingRole === roleKey;

            return (
              <div
                key={roleKey}
                onClick={() => !isLoading && handleSelectRole(roleKey)}
                className="p-4 rounded-xl bg-vault-surface border border-vault-border hover:border-vault-border/90 hover:bg-vault-subtle/40 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-vault-dark border border-vault-border text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-vault-dark text-vault-dim border border-vault-border">
                      {roleKey}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-vault-text group-hover:text-indigo-400 transition-colors">
                    {userDef.label}
                  </h3>
                  <p className="text-[11px] font-mono text-vault-dim mt-0.5">{userDef.email}</p>
                  <p className="text-xs text-vault-muted mt-2 leading-relaxed">
                    {userDef.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-vault-border/60 flex items-center justify-between text-xs font-medium text-vault-dim group-hover:text-indigo-400 transition-colors">
                  <span>{isLoading ? 'Authenticating...' : 'Sign In as Role'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <span className="text-[11px] font-mono text-vault-dim">
            NovaTech Systems Enterprise Workspace · Demo Environment
          </span>
        </div>
      </div>
    </div>
  );
}
