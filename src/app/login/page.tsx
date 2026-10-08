'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from '@/components/ui/icons';
import { useAuth } from '@/context/AuthContext';
import { DEMO_PROFILES } from '@/lib/demo-users';
import { UserRole } from '@/lib/types';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';
import './login.css';

const descriptions: Record<UserRole, string> = {
  ADMIN: 'See the organization-wide picture',
  MANAGER: 'Find risks across a team',
  EMPLOYEE: 'Contribute and hand off knowledge',
  NEW_EMPLOYEE: 'Find trusted answers',
};

export default function LoginPage() {
  const { login, register, error: authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'register' && !name.trim()) { setError('Enter your full name.'); return; }
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError(null);
    try {
      const success = mode === 'login' ? await login(email.trim(), password) : await register(name.trim(), email.trim(), password);
      if (!success) setError(authError || 'We could not open your workspace. Check your details and try again.');
    } catch { setError('Unable to connect right now. Please try again.'); }
    finally { setLoading(false); }
  }

  async function openDemo(role: UserRole) {
    setLoadingRole(role);
    setError(null);
    try { if (!await login(undefined, undefined, role)) setError('Unable to open the demo. Please try again.'); }
    catch { setError('Unable to connect right now. Please try again.'); }
    finally { setLoadingRole(null); }
  }

  return <main className="kv-login">
    <header className="kv-login-header"><Link href="/" className="kv-login-brand"><KnowledgeVaultLogo size={25} /><span>knowledgevault<span className="kv-login-brand-dot">.</span></span></Link><Link href="/" className="kv-login-back">Explore the product <ArrowUpRight size={15} /></Link></header>
    <div className="kv-login-layout">
      <section className="kv-login-story" aria-label="About KnowledgeVault"><div className="kv-login-story-copy"><div className="kv-login-eyebrow"><span /> YOUR TEAM&apos;S LIVING MEMORY</div><h1>All the context.<br /><em>Still here.</em></h1><p>A calmer way to capture the knowledge behind the work, see what is at risk, and find answers you can trust.</p></div><div className="kv-login-preview" aria-label="Example knowledge answer"><div className="kv-login-preview-head"><span><Sparkles size={14} /> Knowledge answer</span><span>VERIFIED</span></div><p className="kv-login-question">What happens when a payment retry fails?</p><p className="kv-login-answer">The retry enters a three-stage recovery sequence. After the final attempt, the event is routed to the dead-letter queue for manual review.</p><div className="kv-login-citation"><span><ShieldCheck size={15} /> Source confirmed</span><span>Payment retry runbook · p. 4</span></div></div><div className="kv-login-story-foot"><span>Capture what matters</span><span>See what&apos;s missing</span><span>Trust every answer</span></div></section>
      <section className="kv-login-card" aria-labelledby="kv-login-title"><div className="kv-login-card-head"><span className="kv-login-overline">THE KNOWLEDGEVAULT WORKSPACE</span><h2 id="kv-login-title">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p>{mode === 'login' ? 'Pick up where your team left off.' : 'Start building a more resilient team memory.'}</p></div>
        <div className="kv-login-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setError(null); }}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setError(null); }}>Create account</button></div>
        {error && <div className="kv-login-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="kv-login-form">
          {mode === 'register' && <label><span>Full name</span><div><UserRound size={18} /><input value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" autoComplete="name" required /></div></label>}
          <label><span>Work email</span><div><Mail size={18} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></div></label>
          <label><span>Password</span><div><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          {mode === 'login' && <Link className="kv-login-forgot" href="/forgot-password">Forgot password?</Link>}
          <button type="submit" className="kv-login-submit" disabled={loading}>{loading ? 'Opening workspace…' : mode === 'login' ? 'Enter workspace' : 'Create account'} <ArrowRight size={17} /></button>
        </form>
        <div className="kv-login-divider"><span>OR EXPLORE AS A DEMO PERSONA</span></div>
        <div className="kv-login-roles">{DEMO_PROFILES.map(profile => <button type="button" key={profile.role} onClick={() => openDemo(profile.role)} disabled={loadingRole !== null}><span className={`kv-login-avatar kv-login-avatar-${profile.role.toLowerCase()}`}>{profile.name.slice(0, 1)}</span><span className="kv-login-role-copy"><strong>{profile.role.replace('_', ' ').toLowerCase()}</strong><small>{descriptions[profile.role]}</small></span><ArrowUpRight size={17} /></button>)}</div>
        <p className="kv-login-footnote">{loadingRole ? 'Opening demo workspace…' : 'Explore instantly. Each persona has a tailored workspace.'}</p>
      </section>
    </div>
  </main>;
}
