'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
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
} from 'lucide-react';
import { DEMO_PROFILES } from '@/lib/demo-users';
import { UserRole } from '@/lib/types';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, error: authError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your work email.'); return; }
    setLoading(true);
    setError(null);
    let success = false;
    if (mode === 'login') success = await login(email.trim(), password);
    else success = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!success) setError(authError || (mode === 'login' ? 'Authentication failed. Verify your email or password.' : 'Registration failed. Please try again.'));
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
      if (res.ok) window.location.href = '/dashboard';
      else setError(data.error || 'Authentication failed');
    } catch { setError('Network error during authentication'); }
    finally { setLoadingRole(null); }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError(null);
  };

  const roleCardColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':        return 'bg-[#FCA8CA]/20 border-[#FCA8CA]/50 hover:border-[#FCA8CA]';
      case 'MANAGER':      return 'bg-[#A0C4F6]/20 border-[#A0C4F6]/50 hover:border-[#A0C4F6]';
      case 'EMPLOYEE':     return 'bg-[#C8A2F9]/20 border-[#C8A2F9]/50 hover:border-[#C8A2F9]';
      case 'NEW_EMPLOYEE': return 'bg-[#F8BFA5]/20 border-[#F8BFA5]/50 hover:border-[#F8BFA5]';
    }
  };

  const roleAvatarColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':        return 'bg-[#FCA8CA]';
      case 'MANAGER':      return 'bg-[#A0C4F6]';
      case 'EMPLOYEE':     return 'bg-[#C8A2F9]';
      case 'NEW_EMPLOYEE': return 'bg-[#F8BFA5]';
    }
  };

  const roleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':        return 'badge-role-admin';
      case 'MANAGER':      return 'badge-role-manager';
      case 'EMPLOYEE':     return 'badge-role-emp';
      case 'NEW_EMPLOYEE': return 'badge-role-new';
    }
  };

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex selection:bg-[#C8A2F9]/30">
      {/* Left side: Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-vault-surface border-r border-vault-border flex-col justify-between p-12 relative overflow-hidden">
        {/* Warm decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#F8D4A7]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#C8A2F9]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-[#F391AC]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-vault-text flex items-center justify-center text-vault-dark shadow-card">
            <KnowledgeVaultLogo size={20} />
          </div>
          <div>
            <span className="font-bold text-[15px] tracking-tight text-vault-text block">KnowledgeVault AI</span>
            <span className="text-[11px] text-vault-dim">Enterprise Knowledge Continuity Engine</span>
          </div>
        </div>

        {/* Center Message */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C8A2F9]/20 border border-[#C8A2F9]/40 text-[#7C6AF7] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Access Control Active</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-vault-text leading-tight">
            Turn employee experience into a living, searchable organizational memory.
          </h2>

          <p className="text-[14px] text-vault-muted leading-relaxed">
            Eliminate single points of failure before engineers depart. Granular data-level
            governance ensures staff view project context while executive risk assessments remain isolated.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-3xl bg-[#F8D4A7]/30 border border-[#F8D4A7]/60">
              <span className="text-[10px] font-bold text-vault-dim uppercase tracking-wider block mb-1">Security Model</span>
              <span className="text-[13px] font-bold text-vault-text block">Server-Enforced RBAC</span>
              <p className="text-[11px] text-vault-muted mt-1">Unauthorized data never enters vector retrieval or LLM prompts.</p>
            </div>
            <div className="p-4 rounded-3xl bg-[#C8A2F9]/20 border border-[#C8A2F9]/40">
              <span className="text-[10px] font-bold text-vault-dim uppercase tracking-wider block mb-1">Exit Mode Engine</span>
              <span className="text-[13px] font-bold text-vault-text block">Targeted AI Interviews</span>
              <p className="text-[11px] text-vault-muted mt-1">Codifies tacit heuristics into permanent institutional memory.</p>
            </div>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="flex items-center gap-6 text-[11px] text-vault-dim font-medium relative z-10">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> SOC2 Type II</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#C8A2F9]" /> AES-256 Encrypted</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#A0C4F6]" /> Audit Logged</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 max-w-xl mx-auto w-full">
        <div className="space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-vault-text flex items-center justify-center text-vault-dark">
              <KnowledgeVaultLogo size={18} />
            </div>
            <span className="font-bold text-[14px] text-vault-text">KnowledgeVault AI</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">
              {mode === 'login' ? 'Welcome back 👋' : 'Join NovaTech Workspace'}
            </h1>
            <p className="text-[13px] text-vault-muted mt-1">
              {mode === 'login'
                ? 'Sign in with your credentials or pick a demo persona below.'
                : 'Create an account to join the workspace.'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-vault-subtle rounded-2xl border border-vault-border">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all ${
                mode === 'login' ? 'bg-vault-surface text-vault-text shadow-card' : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-xl transition-all ${
                mode === 'register' ? 'bg-vault-surface text-vault-text shadow-card' : 'text-vault-muted hover:text-vault-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#F391AC]/15 border border-[#F391AC]/40 text-[#8b0a30] text-[12px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#F391AC]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-[12px] font-semibold text-vault-muted block mb-2">Full Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="vault-input pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[12px] font-semibold text-vault-muted block mb-2">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@novatech.demo"
                  className="vault-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-vault-muted block mb-2">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="vault-input pl-10 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-vault-dim hover:text-vault-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <a href="/forgot-password" className="text-[12px] text-vault-muted hover:text-vault-text transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-2xl disabled:opacity-50"
            >
              {loading
                ? (mode === 'login' ? 'Authenticating...' : 'Creating Account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-vault-border" />
            </div>
            <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider">
              <span className="bg-vault-bg px-3 text-vault-dim">Or select a demo persona</span>
            </div>
          </div>

          {/* Demo Persona Cards */}
          <div className="grid grid-cols-2 gap-3">
            {DEMO_PROFILES.map((profile) => {
              const isLoading = loadingRole === profile.role;
              return (
                <div
                  key={profile.role}
                  className={`p-3.5 rounded-3xl border-2 transition-all group cursor-pointer ${roleCardColor(profile.role)}`}
                  onClick={() => handleSelectRole(profile.role)}
                >
                  <div className="flex items-start gap-2.5 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${roleAvatarColor(profile.role)}`}>
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[12px] font-bold text-vault-text truncate">{profile.name}</h3>
                      <p className="text-[10px] text-vault-dim truncate mt-0.5">{profile.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${roleBadgeClass(profile.role)}`}>
                      {profile.role.replace('_', ' ')}
                    </span>
                    {profile.name.includes('Rahul') && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F8BFA5]/40 text-[#7a3010]">EXIT</span>
                    )}
                    {profile.name.includes('Alex') && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#C8A2F9]/30 text-[#4a1a8b]">NEW</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectRole(profile.role); }}
                    disabled={isLoading}
                    className="mt-3 w-full py-1.5 px-3 rounded-2xl bg-vault-surface text-[11px] font-bold text-vault-text border border-vault-border hover:bg-vault-text hover:text-vault-dark transition-all text-center disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : '1-Click Login →'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Demo Password Hint */}
          <div className="p-3.5 rounded-2xl bg-vault-surface border border-vault-border flex items-center justify-between">
            <span className="text-[12px] text-vault-muted font-medium">Universal Demo Password:</span>
            <code className="font-mono text-[13px] font-bold text-[#7C6AF7] bg-[#C8A2F9]/15 px-2.5 py-1 rounded-xl border border-[#C8A2F9]/30">
              demo123
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
