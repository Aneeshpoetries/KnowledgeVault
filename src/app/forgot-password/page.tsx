'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle,
  Eye, EyeOff, ShieldCheck, RefreshCw, ArrowRight, Terminal,
} from '@/components/ui/icons';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

type Step = 'email' | 'otp' | 'password' | 'done';

/* ── Step Indicator ─────────────────────────────────────────────────────────── */
function StepIndicator({ step }: { step: Step }) {
  const current = step === 'email' ? 1 : step === 'otp' ? 2 : 3;
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((n) => (
        <React.Fragment key={n}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
            n < current
              ? 'bg-[#3B234A] text-[#F7D480] shadow-sm'
              : n === current
              ? 'bg-vault-text text-vault-dark ring-4 ring-vault-text/20'
              : 'bg-vault-subtle border border-vault-border text-vault-dim'
          }`}>
            {n < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
          </div>
          {n < 3 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${n < current ? 'bg-vault-text' : 'bg-vault-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── OTP Input ───────────────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = [...value];
      pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
      onChange(next);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-vault-subtle text-vault-text focus:outline-none transition-all duration-150 ${
            value[i]
              ? 'border-vault-text bg-[#F8D4A7]/30 text-vault-text'
              : 'border-vault-border focus:border-vault-text/50'
          }`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

/* ── Password Strength ───────────────────────────────────────────────────────── */
function PwStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength =
    password.length < 6  ? { label: 'Too short', color: 'bg-[#492047]', pct: 15 } :
    password.length < 8  ? { label: 'Weak',      color: 'bg-[#482342]', pct: 40 } :
    password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)
                         ? { label: 'Good',      color: 'bg-[#3B234A]', pct: 70 }
                         : { label: 'Strong',    color: 'bg-[#262958]', pct: 100 };

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 bg-vault-subtle rounded-full overflow-hidden border border-vault-border">
        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.pct}%` }} />
      </div>
      <p className="text-[11px] font-semibold text-vault-muted">{strength.label}</p>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setDevCode(data._devCode || null);
      setResendCooldown(60);
      setStep('otp');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      setResetToken(data.resetToken);
      setStep('password');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (step === 'otp' && otpDigits.join('').length === 6) handleVerifyOtp();
  }, [otpDigits]);

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setStep('done');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const stepLabel: Record<Step, string> = {
    email: 'Reset Your Password', otp: 'Enter Verification Code',
    password: 'Set New Password', done: 'All Done!',
  };

  return (
    <div className="min-h-screen bg-[var(--vault-bg)] flex items-center justify-center p-4">
      {/* Warm blobs */}
      <div className="fixed top-1/4 left-1/4 w-80 h-80 bg-[#F8D4A7]/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 bg-[#C8A2F9]/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#3B234A] flex items-center justify-center shadow-sm">
            <KnowledgeVaultLogo size={20} className="text-[#F7D480]" />
          </div>
          <div>
            <span className="font-bold text-[15px] text-vault-text block leading-tight">KnowledgeVault AI</span>
            <span className="text-[11px] text-vault-muted">Enterprise Knowledge Continuity</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-vault-surface border border-vault-border rounded-xl p-8 shadow-card">

          {step !== 'done' && <StepIndicator step={step} />}

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-[18px] font-bold tracking-tight text-vault-text">{stepLabel[step]}</h1>
            {step === 'email' && <p className="text-[13px] text-vault-muted mt-1 leading-relaxed">Enter your email address and we&apos;ll send you a verification code.</p>}
            {step === 'otp'   && <p className="text-[13px] text-vault-muted mt-1">We sent a 6-digit code to <span className="font-semibold text-vault-text">{email}</span>.</p>}
            {step === 'password' && <p className="text-[13px] text-vault-muted mt-1">Choose a strong new password for your account.</p>}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#F391AC]/15 border border-[#F391AC]/30 text-[#FF75BF] text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF75BF]" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" autoFocus
                  className="w-full bg-vault-subtle border border-vault-border rounded-2xl pl-10 pr-4 py-3 text-[14px] text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-vault-text/50 transition-colors"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl bg-vault-text hover:opacity-85 text-vault-dark text-[14px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-card">
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-vault-dark/30 border-t-vault-dark animate-spin" /><span>Sending…</span></>
                  : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {devCode && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8D4A7]/30 border border-[#F8D4A7]/50 text-[#F7D480] text-[12px]">
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span>Dev mode — your code: <strong className="font-mono tracking-widest">{devCode}</strong></span>
                </div>
              )}
              <OtpInput value={otpDigits} onChange={setOtpDigits} />
              <button type="submit" disabled={loading || otpDigits.join('').length < 6}
                className="w-full py-3 rounded-2xl bg-vault-text hover:opacity-85 text-vault-dark text-[14px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-card">
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-vault-dark/30 border-t-vault-dark animate-spin" /><span>Verifying…</span></>
                  : <><ShieldCheck className="w-4 h-4" /><span>Verify Code</span></>
                }
              </button>
              <div className="text-center">
                {resendCooldown > 0
                  ? <p className="text-[12px] text-vault-dim">Resend in <span className="font-semibold text-vault-text">{resendCooldown}s</span></p>
                  : <button type="button" onClick={() => { setOtpDigits(Array(6).fill('')); setError(null); handleSendOtp(); }}
                      className="text-[12px] font-semibold text-vault-muted hover:text-vault-text transition-colors flex items-center gap-1.5 mx-auto">
                      <RefreshCw className="w-3.5 h-3.5" />Resend code
                    </button>
                }
              </div>
              <button type="button" onClick={() => { setStep('email'); setError(null); setOtpDigits(Array(6).fill('')); }}
                className="text-[12px] text-vault-dim hover:text-vault-text transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />Change email
              </button>
            </form>
          )}

          {/* ── Step 3: Password ── */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-vault-dim block mb-2">New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters" autoFocus
                    className="w-full bg-vault-subtle border border-vault-border rounded-2xl pl-10 pr-10 py-3 text-[14px] font-mono text-vault-text focus:outline-none focus:border-vault-text/50 transition-colors" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3 text-vault-dim hover:text-vault-text">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PwStrength password={password} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-vault-dim block mb-2">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-vault-dim" />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password"
                    className={`w-full bg-vault-subtle border rounded-2xl pl-10 pr-10 py-3 text-[14px] font-mono text-vault-text focus:outline-none transition-colors ${
                      confirmPw && confirmPw !== password ? 'border-[#F391AC]/60' : 'border-vault-border focus:border-vault-text/50'
                    }`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3 text-vault-dim hover:text-vault-text">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPw && confirmPw !== password && <p className="text-[11px] text-[#FF75BF] mt-1.5 font-semibold">Passwords do not match</p>}
                {confirmPw && confirmPw === password && password.length >= 6 && (
                  <p className="text-[11px] text-[#10B981] mt-1.5 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Passwords match</p>
                )}
              </div>
              <button type="submit" disabled={loading || password.length < 6 || password !== confirmPw}
                className="w-full py-3 rounded-2xl bg-vault-text hover:opacity-85 text-vault-dark text-[14px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-card">
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-vault-dark/30 border-t-vault-dark animate-spin" /><span>Updating…</span></>
                  : <><ShieldCheck className="w-4 h-4" /><span>Reset Password</span></>
                }
              </button>
            </form>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#A0C4F6]/30 border border-[#A0C4F6]/50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#93C8FF]" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-vault-text">Password Reset!</p>
                <p className="text-[13px] text-vault-muted mt-1.5 leading-relaxed">Your password has been updated. Redirecting to sign in…</p>
              </div>
              <Link href="/login" className="mt-2 w-full py-3 rounded-2xl bg-vault-text hover:opacity-85 text-vault-dark text-[14px] font-bold transition-all text-center shadow-card">
                Go to Sign In
              </Link>
            </div>
          )}

          {/* Back link */}
          {step === 'email' && (
            <div className="mt-6 pt-5 border-t border-vault-border/60">
              <Link href="/login" className="flex items-center gap-1.5 text-[13px] text-vault-dim hover:text-vault-text transition-colors font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
