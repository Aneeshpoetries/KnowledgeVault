'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, FileText, Lightbulb, Pause, Play, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

const scenes = [
  { label: 'Discover', title: 'Find the missing context.', caption: 'Start with the risk that matters most.' },
  { label: 'Capture', title: 'Ask what only they know.', caption: 'A focused conversation preserves the reasoning.' },
  { label: 'Structure', title: 'Turn insight into memory.', caption: 'People, systems, actions and evidence stay connected.' },
  { label: 'Retrieve', title: 'Give the next person clarity.', caption: 'A trusted answer, with its source in view.' },
];

export function CinematicDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setScene(current => (current + 1) % scenes.length), 5800);
    return () => window.clearInterval(timer);
  }, [playing, visible]);

  return <section ref={sectionRef} className="kv-cinema" id="product-demo" aria-label="Interactive product preview">
    <div className="kv-cinema-landscape" aria-hidden="true"><i /><i /><i /></div>
    <div className="kv-cinema-content kv-container">
      <div className="kv-cinema-tabs"><div role="tablist" aria-label="Product capabilities">{scenes.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={scene === index} onClick={() => { setScene(index); setPlaying(false); }}>{item.label}</button>)}</div><button type="button" className="kv-cinema-play" aria-label={playing ? 'Pause preview' : 'Play preview'} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button></div>
      <div className="kv-cinema-heading" aria-live="polite"><h2 key={scenes[scene].title}>{scenes[scene].title}</h2><p>{scenes[scene].caption}</p></div>
      <div className="kv-cinema-browser">
        <div className="kv-cinema-chrome"><span className="kv-cinema-dots"><i /><i /><i /></span><span>knowledgevault.ai</span><span>↗</span></div>
        <div className="kv-cinema-app">
          <aside className="kv-cinema-rail"><span className="kv-cinema-glyph">✦</span><span>＋</span><Search size={16} /><FileText size={16} /><span className="kv-cinema-rail-spacer" /><span>○</span></aside>
          <div className="kv-cinema-app-body">
            <div className="kv-cinema-workspace-top"><span>Workspace <ChevronRight size={12} /> Knowledge continuity</span><span>Acme / Product team</span></div>
            <div className="kv-cinema-underlay"><div><span className="kv-cinema-kicker">GOOD MORNING, MARCUS</span><h3>Your team&apos;s memory</h3><p>Three knowledge gaps need attention today.</p></div><div className="kv-cinema-underlay-panels"><article><Lightbulb size={18} /><strong>Payment retry logic</strong><span>One owner · High risk</span></article><article><ShieldCheck size={18} /><strong>Verified answers</strong><span>42 memories available</span></article><article><FileText size={18} /><strong>Handover in progress</strong><span>Rahul Sharma · 3 topics</span></article></div></div>
            <div className="kv-cinema-veil" />
            <div className="kv-cinema-dialog" key={scene}>
              <div className="kv-cinema-dialog-close"><X size={16} /></div>
              {scene === 0 && <><span className="kv-cinema-modal-kicker"><Sparkles size={14} /> START WITH WHAT MATTERS</span><h3>What knowledge should we preserve?</h3><div className="kv-cinema-prompt"><Lightbulb size={18} /><p>Rahul is leaving the Payments team. Find the undocumented retry behavior and ask about the recovery steps.</p><span className="kv-cinema-prompt-arrow"><ArrowRight size={16} /></span></div><p className="kv-cinema-from">Start from an example</p><div className="kv-cinema-examples"><span>⌁ &nbsp; Payment recovery</span><span>◌ &nbsp; Incident handover</span><span>✧ &nbsp; Critical dependency</span><span>◇ &nbsp; New teammate guide</span></div></>}
              {scene === 1 && <><span className="kv-cinema-modal-kicker"><span className="kv-cinema-pulse" /> LIVE INTERVIEW · RAHUL SHARMA</span><h3>Let&apos;s capture the reason behind the fix.</h3><div className="kv-cinema-dialog-thread"><span>KNOWLEDGEVAULT</span><p>When payment retries start timing out, what do you check before restarting the worker?</p></div><div className="kv-cinema-dialog-reply"><span>RAHUL SHARMA</span><p>Redis queue depth first. Restarting before the backlog clears can duplicate charges, especially during peak billing.</p></div><div className="kv-cinema-dialog-progress"><span>Reason captured</span><i /><strong>2 of 3</strong></div></>}
              {scene === 2 && <><span className="kv-cinema-modal-kicker"><Check size={15} /> MEMORY CREATED</span><h3>Payment recovery sequence</h3><p className="kv-cinema-intro">Rahul&apos;s experience becomes a reusable, reviewable operational memory.</p><div className="kv-cinema-memory-grid"><div><small>SYSTEM</small><strong>Payment Service</strong></div><div><small>DEPENDENCY</small><strong>Redis → Worker</strong></div><div><small>FIRST ACTION</small><strong>Check queue depth</strong></div><div><small>RISK</small><strong>Duplicate charges</strong></div></div><div className="kv-cinema-evidence"><ShieldCheck size={18} /><span>Interview evidence attached</span><strong>92% confidence</strong></div></>}
              {scene === 3 && <><span className="kv-cinema-modal-kicker"><Search size={14} /> ASK YOUR ORGANIZATIONAL MEMORY</span><h3>Why check Redis before a payment restart?</h3><div className="kv-cinema-answer"><Sparkles size={19} /><p>A queue backlog changes retry behavior. Restarting the worker before clearing it can trigger duplicate charges during peak billing.</p></div><div className="kv-cinema-answer-source"><FileText size={17} /><span>Exit interview · Rahul Sharma</span><strong>Verified source <ArrowUpRight size={13} /></strong></div><div className="kv-cinema-answer-source"><FileText size={17} /><span>Incident #382</span><strong>Related evidence <ArrowUpRight size={13} /></strong></div></>}
            </div>
          </div>
        </div>
      </div>
      <div className="kv-cinema-bottom"><span>AN INTERACTIVE PREVIEW OF THE CONTINUITY LOOP</span><Link href="/login">Explore the real workspace <ArrowUpRight size={16} /></Link></div>
    </div>
  </section>;
}
