'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Send,
  Sparkles,
  Download,
  Printer,
  FileJson,
  Layers,
  Brain,
  ShieldAlert,
  RotateCcw,
  User,
  Check,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { RiskBadge, ConfidenceBadge } from '@/components/ui/Badges';
import { AccessForbidden } from '@/components/ui/AccessForbidden';
import { useAuth } from '@/context/AuthContext';

export default function EmployeeExitModeInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.employeeId as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recoveredItems, setRecoveredItems] = useState<any[]>([]);
  const [completedReport, setCompletedReport] = useState<any>(null);
  const [lastExtractedTitle, setLastExtractedTitle] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState('');

  // High-fidelity realistic expert responses for 1-click evaluation
  const demoAnswers: Record<number, string> = {
    1: 'During peak billing hours, Chase Paymentech 3DS biometric challenges can take up to 8,500ms, while our Envoy proxy default cut off at 5,000ms. If you deploy during 10am-2pm EST, connections get severed while the credit card charge succeeds downstream, causing duplicate charges. Never restart payment service during billing hours, and always verify Redis queue depth is below 500.',
    2: 'When Chase primary gateway hangs without HTTP response, execute `kubectl exec -it deployment/payment-service -- ./switch-gateway.sh --provider=adyen-backup --auth-token=$CHASE_FALLBACK_KEY`. This bypasses Chase and routes card authorizations through Adyen secondary pipe within 45 seconds.',
    3: 'The midnight settlement script `reconcile_v1.py` spawns 4 concurrent thread pools which overwhelms PgBouncer with 120 sockets. In Kubernetes ConfigMap, you must pass `SPRING_BATCH_SETTLEMENT_MAX_THREADS=15` or midnight payments will stall with connection pool exhaustion.',
  };

  const missingKnowledgeItems = [
    { title: 'Payment Gateway Failover & Adyen Bypass', category: 'Troubleshooting' },
    { title: 'PostgreSQL PgBouncer Midnight Pool Sizing', category: 'Incident Ops' },
    { title: 'Chase Paymentech 3DS Timeout Discrepancies', category: 'Edge Cases' },
    { title: 'Secrets Rotation & Redis Invalidation Cron', category: 'Credentials' },
  ];

  useEffect(() => {
    async function initSession() {
      if (!employeeId) return;
      try {
        const empRes = await fetch(`/api/employees/${employeeId}`);
        const empData = await empRes.json();
        setEmployee(empData.employee);

        const sessRes = await fetch('/api/exit/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId }),
        });

        if (sessRes.status === 403) {
          const errData = await sessRes.json();
          setIsForbidden(true);
          setForbiddenMessage(errData.error || 'You do not have permission to access this Exit Mode session.');
          return;
        }

        const sessData = await sessRes.json();
        setSession(sessData.session);

        const unanswered = sessData.session?.questions?.find(
          (q: any) => !q.answers || q.answers.length === 0
        );
        setCurrentQuestion(unanswered || sessData.session?.questions?.[0]);
      } catch (err) {
        console.error('Failed to init exit mode:', err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [employeeId]);

  const handleSubmitAnswer = async (overrideText?: string) => {
    const textToSubmit = overrideText || answerInput;
    if (!textToSubmit.trim() || submitting || !session || !currentQuestion) return;

    setSubmitting(true);
    setLastExtractedTitle(null);

    try {
      const res = await fetch('/api/exit/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          answer: textToSubmit.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.createdItems && data.createdItems.length > 0) {
          setRecoveredItems((prev) => [...data.createdItems, ...prev]);
          setLastExtractedTitle(data.createdItems[0].title);
        }

        // Update session live coverage score
        setSession((prev: any) => ({
          ...prev,
          finalCoverage: data.newCoverage,
          itemsRecovered: (prev?.itemsRecovered || 0) + (data.createdItems?.length || 1),
        }));

        setAnswerInput('');

        // Progress to next question or complete interview
        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        } else {
          // Complete session
          const completeRes = await fetch('/api/exit/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.id }),
          });
          const completeData = await completeRes.json();
          setCompletedReport(completeData.report || completeData.session);
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to process response');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCoverage = session?.finalCoverage ?? session?.initialCoverage ?? 54;
  const initialCoverage = session?.initialCoverage ?? 54;

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Initializing knowledge recovery workspace...
        </div>
      </AppShell>
    );
  }

  if (isForbidden) {
    return (
      <AppShell>
        <AccessForbidden
          title="Exit Mode Session Restricted"
          message={forbiddenMessage || 'This Exit Mode session is outside your workspace permissions.'}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
          <Link
            href="/exit-mode"
            className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exit Mode Hub</span>
          </Link>

          <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Tacit Knowledge Interview Active
          </span>
        </div>

        {/* Section 26: Top Recovery Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-0.5">
              Knowledge Recovery Workspace
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              {employee?.name || 'Rahul Sharma'} · {employee?.role || 'Staff Infrastructure Engineer'}
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Recover the operational procedures and failure modes that only {employee?.name?.split(' ')[0] || 'Rahul'} knows.
            </p>
          </div>
        </div>

        {/* Interview Workspace vs Completed Report */}
        {!completedReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / MAIN COLUMN: Calm AI Knowledge Interview (cols 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-5">
                {/* Interview Stage Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-vault-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Bot className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-medium text-vault-text">AI Continuity Interviewer</span>
                  </div>

                  <span className="text-[11px] font-mono text-vault-dim">
                    Category: <strong className="text-vault-text font-normal">{currentQuestion?.category || 'Troubleshooting'}</strong>
                  </span>
                </div>

                {/* The AI Question */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
                    Targeted Inquiry
                  </span>
                  <p className="text-base sm:text-lg font-medium text-vault-text leading-snug">
                    {currentQuestion?.question ||
                      'What usually breaks during high-volume payment settlement, and how do you manually recover the service?'}
                  </p>
                  {currentQuestion?.rationale && (
                    <p className="text-xs text-vault-dim italic">
                      Why AI is asking: {currentQuestion.rationale}
                    </p>
                  )}
                </div>

                {/* Dynamic Notification of Discovered Knowledge (Section 28) */}
                {lastExtractedTitle && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Knowledge discovered: <strong>{lastExtractedTitle}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300">Coverage Updated</span>
                  </div>
                )}

                {/* Answer Input Area */}
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={5}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Describe the real operational steps, undocumented commands, or mental rules you follow..."
                    className="w-full bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg p-3 text-xs sm:text-sm text-vault-text placeholder:text-vault-dim focus:outline-none transition-colors"
                  />

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const qOrder = currentQuestion?.order || 1;
                        const sample = demoAnswers[qOrder] || demoAnswers[1];
                        setAnswerInput(sample);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load realistic demo answer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitAnswer()}
                      disabled={!answerInput.trim() || submitting}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-medium text-white transition-all shadow-glowIndigo"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Extracting knowledge...' : 'Submit & Recover Knowledge'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Continuity Ring & Missing Knowledge (cols 4) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Continuity Ring: Before -> Current (Section 26 & 29) */}
              <div className="p-5 rounded-xl bg-vault-surface border border-vault-border text-center space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                  Continuous Knowledge Recovery
                </span>

                <div className="flex justify-center my-2">
                  <CoverageRing
                    score={currentCoverage}
                    size={160}
                    strokeWidth={8}
                    label="COVERAGE"
                    sublabel={currentCoverage > initialCoverage ? 'Progressing' : 'Baseline'}
                  />
                </div>

                <div className="flex items-center justify-center gap-3 text-xs font-mono pt-2 border-t border-vault-border/60">
                  <span className="text-vault-dim">Initial: {initialCoverage}%</span>
                  <span className="text-vault-dim">→</span>
                  <span className="text-indigo-400 font-semibold">Current: {currentCoverage}%</span>
                </div>
              </div>

              {/* Missing Knowledge Checklist */}
              <div className="p-5 rounded-xl bg-vault-surface border border-vault-border space-y-3 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                  Targeted Gaps in Rahul&apos;s Domain
                </span>

                <div className="space-y-2">
                  {missingKnowledgeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-vault-dark border border-vault-border/60 flex items-start gap-2.5"
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-vault-text truncate">{item.title}</p>
                        <span className="text-[10px] font-mono text-vault-dim">{item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovered Items Preview */}
              {recoveredItems.length > 0 && (
                <div className="p-5 rounded-xl bg-vault-surface border border-vault-border space-y-3 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                    Recovered Knowledge ({recoveredItems.length})
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recoveredItems.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-vault-dark border border-emerald-500/20 text-xs"
                      >
                        <p className="font-medium text-vault-text truncate">{it.title}</p>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {it.confidence ? `${Math.round(it.confidence * 100)}% verified` : 'Approved'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Section 30: Completion State & Handover Report */
          <div className="p-8 rounded-xl bg-vault-surface border border-vault-border space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-vault-border/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  Recovery Complete
                </span>
                <h2 className="text-xl font-semibold text-vault-text">
                  Your organization&apos;s memory is stronger.
                </h2>
                <p className="text-xs text-vault-muted mt-0.5">
                  Tacit knowledge transfer successfully conducted for {employee?.name || 'Rahul Sharma'}.
                </p>
              </div>
            </div>

            {/* Metrics Comparison: Before 54% -> After 78% */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-vault-dark border border-vault-border">
                <span className="text-[10px] font-mono text-vault-dim block">Before Coverage</span>
                <span className="text-2xl font-semibold font-mono text-vault-dim">
                  {initialCoverage}%
                </span>
              </div>
              <div className="p-4 rounded-lg bg-vault-dark border border-indigo-500/40">
                <span className="text-[10px] font-mono text-indigo-400 block">After Coverage</span>
                <span className="text-2xl font-semibold font-mono text-indigo-300">
                  {currentCoverage}%
                </span>
              </div>
              <div className="p-4 rounded-lg bg-vault-dark border border-vault-border">
                <span className="text-[10px] font-mono text-vault-dim block">Recovered Items</span>
                <span className="text-2xl font-semibold font-mono text-emerald-400">
                  {session?.itemsRecovered || recoveredItems.length || 2}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-vault-dark border border-vault-border">
                <span className="text-[10px] font-mono text-vault-dim block">Critical Gaps</span>
                <span className="text-2xl font-semibold font-mono text-cyan-400">
                  4 → 1
                </span>
              </div>
            </div>

            {/* Report Actions: Print / PDF / JSON */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-vault-border/60">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(completedReport, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `knowledge-handover-${employee?.id || 'rahul'}.json`;
                  a.click();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vault-dark border border-vault-border hover:bg-vault-subtle text-xs font-medium text-vault-text transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON Audit</span>
              </button>

              <Link
                href="/knowledge"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-vault-dark border border-vault-border hover:bg-vault-subtle text-xs font-medium text-vault-text transition-colors"
              >
                <span>View Recovered Knowledge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
