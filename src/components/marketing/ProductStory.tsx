'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, FileText, GitBranch, Layers, Network, RotateCcw, ShieldCheck, Sparkles, Users } from 'lucide-react';
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

const sources = [
  { label: 'Documents', detail: 'Deployment runbook', icon: FileText },
  { label: 'GitHub', detail: 'ADR-104 · retry policy', icon: GitBranch },
  { label: 'People', detail: 'Rahul Sharma', icon: Users },
  { label: 'Incidents', detail: 'Incident #382', icon: Layers },
];

export function MemoryGraph({ hero = false }: { hero?: boolean }) {
  const [selected, setSelected] = useState(2);
  return <div className={`kv-memory-graph ${hero ? 'kv-graph-hero' : ''}`}>
    <div className="kv-graph-topline"><span><Network size={14} /> ORGANIZATIONAL CONTEXT</span><span>4 connected sources <i /></span></div>
    <svg className="kv-connection-lines" viewBox="0 0 1100 330" preserveAspectRatio="none" aria-hidden="true"><path d="M175 75 C350 75 320 165 550 165 M175 250 C350 250 320 165 550 165 M925 75 C750 75 780 165 550 165 M925 250 C750 250 780 165 550 165" /><circle cx="550" cy="165" r="100" /><circle cx="550" cy="165" r="135" /></svg>
    <div className="kv-graph-sources">{sources.map(({ label, detail, icon: Icon }, index) => <button key={label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`kv-source-node kv-source-${index} ${selected === index ? 'selected' : ''}`}><span className="kv-node-icon"><Icon size={19} strokeWidth={1.5} /></span><span><strong>{label}</strong><small>{detail}</small></span><span className="kv-node-pin" /></button>)}</div>
    <div className="kv-graph-core"><span className="kv-core-symbol"><KnowledgeVaultLogo size={35} /></span><strong>Organizational<br />memory</strong><small>CONTEXT, NOT JUST CONTENT</small></div>
    <div className="kv-graph-discovery" aria-live="polite"><div><span className="kv-tag kv-tag-risk">{selected === 2 ? 'CRITICAL DEPENDENCY' : 'CONNECTED EVIDENCE'}</span><h3>{selected === 2 ? 'One person. Critical context.' : sources[selected].detail}</h3><p>{selected === 2 ? 'Only Rahul has documented context for payment retry behavior.' : selected === 0 ? 'The deployment runbook links Payment Service to Redis and Billing Service.' : selected === 1 ? 'ADR-104 explains why retry order and idempotency checks matter.' : 'Incident #382 connects queue backlog to timeout behavior and duplicate charges.'}</p></div><a href="#interview" aria-label="Explore the targeted interview"><ArrowRight size={20} /></a></div>
  </div>;
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
    <div className="kv-interview-dialog"><div className="kv-dialog-top"><span className="kv-tag">TARGETED INTERVIEW</span><button type="button" aria-label="Replay interview demonstration" onClick={() => { setTyped(''); setVerified(false); setStep(1); }}><RotateCcw size={17} /></button></div><div className="kv-interview-intro"><div className="kv-ai-symbol"><Sparkles size={23} /></div><h3>Let’s preserve what only you know.</h3><p>One dependency. The right question. A shared understanding.</p></div><div className="kv-interview-question"><span className="kv-eyebrow">KNOWLEDGEVAULT</span><p>I found a critical dependency that isn’t documented. What happens when Billing Service becomes unavailable?</p></div><div className="kv-interview-response"><span className="kv-avatar">RS</span><div><strong>Rahul Sharma <small>Senior Backend Engineer</small></strong><p>{typed || 'Waiting for the interview response…'}</p></div></div>{step >= 2 && <div className="kv-extracted-memory"><div className="kv-object-heading"><Network size={17} /><strong>New organizational memory</strong><span className={`kv-tag ${verified ? 'kv-tag-verified' : ''}`}>{verified ? 'VERIFIED' : 'PENDING REVIEW'}</span></div><dl><div><dt>Dependency</dt><dd>Billing Service → Payment Service</dd></div><div><dt>Failure behavior</dt><dd>Cached invoice fallback</dd></div><div><dt>Risk</dt><dd>Critical · cold cache timeout</dd></div><div><dt>Evidence</dt><dd>Rahul — Exit interview</dd></div></dl><button type="button" className="kv-verify-button" onClick={() => setVerified(true)} disabled={verified}><ShieldCheck size={16} />{verified ? 'Verified · ready for organizational memory' : 'Verify this sample memory'}{!verified && <ArrowRight size={15} />}</button></div>}<div className="kv-interview-footer"><span>Illustrative interview · no live data is changed</span><Link href="/exit-mode">Start your own <ArrowRight size={14} /></Link></div></div>
  </div>;
}

export function ExitDemo() {
  const [after, setAfter] = useState(false);
  return <div className="kv-stage kv-exit-profile"><div className="kv-stage-title"><span>KNOWLEDGE CONTINUITY PROFILE</span><span className="kv-tag">SAMPLE</span></div><div className="kv-profile-person"><span className="kv-avatar">RS</span><div><h3>Rahul Sharma</h3><p>Senior Backend Engineer</p></div></div><div className="kv-profile-coverage"><span>Knowledge coverage<strong>{after ? 86 : 43}%</strong></span><div className="kv-track"><span style={{ width: after ? '86%' : '43%' }} /></div></div><div className="kv-profile-stats"><div><strong>{after ? '1' : '6'}</strong><span>High-risk gaps</span></div><div><strong>{after ? '0' : '4'}</strong><span>Unique dependencies</span></div><div><strong>{after ? '31' : '8'}</strong><span>{after ? 'Verified memories' : 'Unverified memories'}</span></div></div><div className="kv-profile-outcome" aria-live="polite"><CheckCircle2 size={17} />{after ? 'Expertise preserved. A clearer handover for the team.' : 'Targeted questions prepared from the knowledge gaps.'}</div><button type="button" className="kv-demo-button" onClick={() => setAfter(!after)}>{after ? 'Show before capture' : 'See the impact of a focused interview'}<ArrowRight size={16} /></button></div>;
}

export function AnswerDemo() {
  const [asked, setAsked] = useState(false);
  return <div className="kv-answer-workspace"><div className="kv-answer-main"><div className="kv-stage-title"><span><KnowledgeVaultLogo size={19} /> ASK ORGANIZATIONAL MEMORY</span><span>Sample question</span></div><h3>The next incident.<br />A better starting point.</h3><button type="button" className="kv-question-input" onClick={() => setAsked(true)}><span>Payment requests are timing out after the latest deployment. What should I check?</span><span className="kv-send"><ArrowRight size={20} /></span></button>{asked && <div className="kv-grounded-answer" aria-live="polite"><span className="kv-eyebrow"><Check size={14} /> RETRIEVED · CONNECTED · VERIFIED</span><p>Start with Redis memory and queue depth. A cold invoice cache changes the retry behavior when Billing Service is unavailable. Confirm the cache is warm and compare provider timeouts before restarting Payment Service.</p><div className="kv-answer-next"><strong>Next action</strong><span>Inspect Redis queue depth and the invoice cache.</span></div></div>}{!asked && <p className="kv-answer-hint">Try the question to follow the evidence from the interview.</p>}</div><aside className="kv-answer-evidence"><span className="kv-eyebrow">THE EVIDENCE LAYER</span><h4>{asked ? '3 sources. One grounded answer.' : 'Every answer has a history.'}</h4>{['Incident #382','Rahul’s exit interview','Payment deployment guide'].map((source,i) => <details key={source} open={asked || undefined}><summary><FileText size={16} />{source}</summary><p>{['Queue backlog preceded payment timeouts. Restarting before checking the queue caused duplicate requests.','“If the cache is cold, retry behavior changes and requests begin timing out.”','Check Redis memory and queue depth before restarting Payment Service.'][i]}</p></details>)}<footer><span className="kv-tag kv-tag-verified">✓ Verified memory</span><strong>92% confidence</strong></footer></aside></div>;
}
