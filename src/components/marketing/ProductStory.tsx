'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, FileText, Network, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

export function StoryMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (!reduced) observer.observe(element);
    });
    // Content stays readable before hydration and without JavaScript.
    document.documentElement.classList.toggle('kv-motion-ready', !reduced);
    return () => { observer.disconnect(); document.documentElement.classList.remove('kv-motion-ready'); };
  }, []);
  return null;
}

const answer = 'The Payment Service falls back to the cached invoice state. If the cache is cold, retry behavior changes and requests begin timing out.';
export function InterviewDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [verified, setVerified] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStep(current => current === 0 ? 1 : current); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (step !== 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTyped(answer); setStep(2); return; }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 5; setTyped(answer.slice(0, index));
      if (index >= answer.length) { window.clearInterval(timer); setStep(2); }
    }, 35);
    return () => window.clearInterval(timer);
  }, [step]);
  return <div className="kv-interview-workspace" ref={stage}>
    <div className="kv-workspace-label"><span><KnowledgeVaultLogo size={19} />Knowledge transfer</span><span>Payment Service · Sample session</span></div>
    <div className="kv-interview-dialog"><div className="kv-dialog-top"><span className="kv-tag">TARGETED INTERVIEW</span><button type="button" aria-label="Replay interview demonstration" onClick={() => { setTyped(''); setVerified(false); setStep(1); }}><RotateCcw size={17} /></button></div><div className="kv-interview-intro"><div className="kv-ai-symbol"><Sparkles size={23} /></div><h3>Let’s preserve what only you know.</h3><p>One dependency. The right question. A shared understanding.</p></div><div className="kv-interview-question"><span className="kv-eyebrow">KNOWLEDGEVAULT</span><p>I found a critical dependency that isn’t documented. What happens when Billing Service becomes unavailable?</p></div><div className="kv-interview-response"><span className="kv-avatar">RS</span><div><strong>Rahul Sharma <small>Senior Backend Engineer</small></strong><p>{typed || 'Waiting for the interview response…'}</p></div></div>{step >= 2 && <div className="kv-extracted-memory"><div className="kv-object-heading"><Network size={17} /><strong>New organizational memory</strong><span className={`kv-tag ${verified ? 'kv-tag-verified' : ''}`}>{verified ? 'VERIFIED' : 'PENDING REVIEW'}</span></div><dl><div><dt>Dependency</dt><dd>Billing Service → Payment Service</dd></div><div><dt>Failure behavior</dt><dd>Cached invoice fallback</dd></div><div><dt>Risk</dt><dd>Critical · cold cache timeout</dd></div><div><dt>Evidence</dt><dd>Rahul — Exit interview</dd></div></dl><button type="button" className="kv-verify-button" onClick={() => setVerified(true)} disabled={verified}><ShieldCheck size={16} />{verified ? 'Verified · ready for organizational memory' : 'Verify this sample memory'}{!verified && <ArrowRight size={15} />}</button></div>}<div className="kv-interview-footer"><span>Illustrative interview · no live data is changed</span><Link href="/login">Start your own <ArrowRight size={14} /></Link></div></div>
  </div>;
}

export function AnswerDemo() {
  const [asked, setAsked] = useState(false);
  return <div className="kv-answer-workspace"><div className="kv-answer-main"><div className="kv-stage-title"><span><KnowledgeVaultLogo size={19} /> ASK ORGANIZATIONAL MEMORY</span><span>Sample question</span></div><h3>The next incident.<br />A better starting point.</h3><button type="button" className="kv-question-input" onClick={() => setAsked(true)}><span>Payment requests are timing out after the latest deployment. What should I check?</span><span className="kv-send"><ArrowRight size={20} /></span></button>{asked && <div className="kv-grounded-answer" aria-live="polite"><span className="kv-eyebrow"><Check size={14} /> RETRIEVED · CONNECTED · VERIFIED</span><p>Start with Redis memory and queue depth. A cold invoice cache changes the retry behavior when Billing Service is unavailable. Confirm the cache is warm and compare provider timeouts before restarting Payment Service.</p><div className="kv-answer-next"><strong>Next action</strong><span>Inspect Redis queue depth and the invoice cache.</span></div></div>}{!asked && <p className="kv-answer-hint">Try the question to follow the evidence from the interview.</p>}</div><aside className="kv-answer-evidence"><span className="kv-eyebrow">THE EVIDENCE LAYER</span><h4>{asked ? '3 sources. One grounded answer.' : 'Every answer has a history.'}</h4>{['Incident #382','Rahul’s exit interview','Payment deployment guide'].map((source,i) => <details key={source} open={asked || undefined}><summary><FileText size={16} />{source}</summary><p>{['Queue backlog preceded payment timeouts. Restarting before checking the queue caused duplicate requests.','“If the cache is cold, retry behavior changes and requests begin timing out.”','Check Redis memory and queue depth before restarting Payment Service.'][i]}</p></details>)}<footer><span className="kv-tag kv-tag-verified">✓ Verified memory</span><strong>92% confidence</strong><span className="kv-answer-review">Owner: Rahul Sharma · Verified September 2026</span></footer></aside></div>;
}
