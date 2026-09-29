'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Briefcase,
  UserCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
  Terminal,
} from 'lucide-react';
import { DEMO_PROFILES } from '@/lib/demo-users';
import { UserRole } from '@/lib/types';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email.');
      return;
    }
    setLoading(true);
    setError(null);

    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError('Authentication failed. Verify your email or password (demo password: "demo123").');
    }
  };

  const handleSelectRole = async (role: UserRole) => {
    setLoadingRole(role);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error during authentication');
    } finally {
      setLoadingRole(null);
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-vault-dark text-vault-text flex selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left side: Enterprise Brand & Philosophy Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-vault-surface/40 border-r border-vault-border/80 flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KnowledgeVaultLogo size={20} />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-vault-text block">
              KnowledgeVault AI
            </span>
            <span className="text-[11px] text-vault-dim font-mono">
              Enterprise Knowledge Continuity Engine
            </span>
          </div>
        </div>

        {/* Center Philosophy Message */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Access Control Active</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-vault-text leading-tight">
            Turn employee experience into a living, searchable organizational memory.
          </h2>

          <p className="text-sm text-vault-muted leading-relaxed">
            Eliminate single points of failure before engineers depart. Granular data-level
            governance ensures staff view project context while executive risk assessments and audit
            logs remain strictly isolated.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3.5 rounded-lg bg-vault-dark/60 border border-vault-border/60">
              <span className="text-[10px] font-mono text-vault-dim uppercase tracking-wider block">
                Security Model
              </span>
              <span className="text-xs font-medium text-vault-text mt-1 block">
                Server-Enforced RBAC
              </span>
              <p className="text-[11px] text-vault-dim mt-0.5">
                Unauthorized data never enters vector retrieval or LLM prompts.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-vault-dark/60 border border-vault-border/60">
              <span className="text-[10px] font-mono text-vault-dim uppercase tracking-wider block">
                Exit Mode Engine
              </span>
              <span className="text-xs font-medium text-vault-text mt-1 block">
                Targeted AI Interviews
              </span>
              <p className="text-[11px] text-vault-dim mt-0.5">
                Codifies tacit heuristics into permanent institutional memory.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="flex items-center gap-6 text-[11px] text-vault-dim font-mono relative z-10">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SOC2 Type II Certified
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> AES-256 + HMAC SHA-256
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Audit Logged
          </span>
        </div>
      </div>

      {/* Right side: Login Form & Demo Persona Selector */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 max-w-xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <KnowledgeVaultLogo size={16} />
              </div>
              <span className="font-semibold text-xs text-vault-text">KnowledgeVault AI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Sign in to NovaTech Workspace
            </h1>
            <p className="text-xs text-vault-muted">
              Enter your corporate credentials or select a verified demo persona below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-vault-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@novatech.demo"
                  className="w-full bg-vault-surface border border-vault-border rounded-lg pl-9 pr-3 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-vault-dim" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-vault-surface border border-vault-border rounded-lg pl-9 pr-9 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500/80 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-vault-dim hover:text-vault-text"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-vault-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-vault-dark px-2 text-vault-dim">Or Select Demo Persona</span>
            </div>
          </div>

          {/* Demo Personas 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_PROFILES.map((profile) => {
              const isSelectedLoading = loadingRole === profile.role;
              const roleBadgeColor =
                profile.role === 'ADMIN'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : profile.role === 'MANAGER'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : profile.role === 'EMPLOYEE'
                  ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                  : 'text-purple-400 bg-purple-500/10 border-purple-500/30';

              return (
                <div
                  key={profile.role}
                  className="p-3 rounded-xl bg-vault-surface border border-vault-border hover:border-vault-border/90 hover:bg-vault-subtle/50 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider ${roleBadgeColor}`}
                      >
                        {profile.role.replace('_', ' ')}
                      </span>
                      {profile.name.includes('Rahul') && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          EXIT PENDING
                        </span>
                      )}
                      {profile.name.includes('Alex') && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          NEW HIRE
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-semibold text-vault-text group-hover:text-indigo-400 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-[11px] text-vault-dim truncate">{profile.title}</p>
                    <p className="text-[10px] font-mono text-vault-dim/80 mt-0.5">{profile.email}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-vault-border/60">
                    <button
                      type="button"
                      onClick={() => handleSelectRole(profile.role)}
                      disabled={isSelectedLoading}
                      className="flex-1 py-1 px-2 rounded-md bg-vault-dark hover:bg-indigo-600 hover:text-white border border-vault-border text-[11px] font-medium text-vault-muted transition-all text-center"
                    >
                      {isSelectedLoading ? 'Connecting...' : '1-Click Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials(profile.email)}
                      className="py-1 px-2 rounded-md bg-vault-subtle hover:bg-vault-border text-[10px] text-vault-dim hover:text-vault-text transition-colors"
                      title="Fill into email form"
                    >
                      Use
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-vault-surface/60 border border-vault-border/60 flex items-center justify-between text-[11px] text-vault-dim">
            <span>Universal Demo Password:</span>
            <code className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              demo123
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
