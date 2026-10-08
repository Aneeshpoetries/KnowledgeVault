'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
} from '@/components/ui/icons';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
    }
  }, [token]);

  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: '', color: 'bg-vault-border', width: 'w-0' };
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-rose-500', width: 'w-1/4' };
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-amber-500', width: 'w-2/4' };
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vault-dark text-vault-text flex items-center justify-center p-4">
      {/* Background glows */}
      <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KnowledgeVaultLogo size={18} />
          </div>
          <span className="font-semibold text-sm text-vault-text">KnowledgeVault AI</span>
        </div>

        <div className="bg-vault-surface border border-vault-border rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-vault-text">
              Set New Password
            </h1>
            <p className="text-xs text-vault-muted">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Success State */}
          {success && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Password Reset!</p>
                  <p className="text-xs text-vault-muted mt-1">
                    Your password has been updated successfully. Redirecting to sign in...
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="block w-full py-2.5 text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all"
              >
                Go to Sign In Now
              </Link>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Token info */}
              {token && (
                <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-mono truncate text-[10px]">Token: {token.substring(0, 16)}…</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-vault-dim" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoFocus
                    disabled={!token}
                    className="w-full bg-vault-dark border border-vault-border rounded-lg pl-9 pr-9 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500/80 transition-colors font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-vault-dim hover:text-vault-text"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 bg-vault-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-[10px] font-mono ${
                      strength.label === 'Strong' ? 'text-emerald-400' :
                      strength.label === 'Good' ? 'text-yellow-400' :
                      strength.label === 'Weak' ? 'text-amber-500' : 'text-rose-400'
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3 top-2.5 text-vault-dim" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    disabled={!token}
                    className={`w-full bg-vault-dark border rounded-lg pl-9 pr-9 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none transition-colors font-mono disabled:opacity-50 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-vault-border focus:border-indigo-500/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-vault-dim hover:text-vault-text"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === password && password.length >= 6 && (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token || password !== confirmPassword || password.length < 6}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Set New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back link */}
          {!success && (
            <div className="pt-2 border-t border-vault-border/60">
              <Link
                href="/forgot-password"
                className="flex items-center gap-1.5 text-xs text-vault-dim hover:text-vault-text transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-vault-dark flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
