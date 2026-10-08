'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ShieldAlert,
  Sparkles,
  Info,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { demoKnowledge, demoReviews, saveDemoKnowledge, saveDemoReviews } from '@/lib/demo-store';

export default function NewKnowledgePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('TROUBLESHOOTING');
  const [risk, setRisk] = useState('HIGH');
  const [projectId, setProjectId] = useState('cmuk9c89800014yebt84g8dsa');
  const [summary, setSummary] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [content, setContent] = useState('');
  const [problems, setProblems] = useState('');
  const [solutions, setSolutions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and procedure content are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const problemList = problems
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    const solutionList = solutions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (user?.id?.startsWith('demo-')) {
      const record = {
        id: `demo-${Date.now()}`, title: title.trim(), type, risk, confidence: 0.85,
        freshness: 'FRESH', status: 'PENDING_REVIEW',
        summary: summary.trim() || content.trim().slice(0, 160), content: content.trim(),
        whyItMatters: whyItMatters.trim() || 'Essential operational continuity procedure.',
        problemsJson: JSON.stringify(problemList), solutionsJson: JSON.stringify(solutionList), dependenciesJson: '[]',
        source: { name: 'Demo contribution', type: 'INTERVIEW' },
        employee: { id: user.employeeId || user.id, name: user.name },
        project: { id: projectId || 'demo-payment', name: 'Payment System' },
        originalSourceText: content.trim(), verifiedBy: user.name,
        lastVerifiedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
      };
      saveDemoKnowledge([record, ...demoKnowledge()] as any);
      saveDemoReviews([record, ...demoReviews()] as any);
      setSubmitted(true);
      setPendingReview(true);
      setLoading(false);
      setTimeout(() => router.push(user.role === 'EMPLOYEE' ? '/dashboard' : '/knowledge'), 1200);
      return;
    }

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          risk,
          projectId: projectId || undefined,
          summary: summary.trim() || content.trim().slice(0, 160),
          whyItMatters: whyItMatters.trim() || 'Essential operational continuity procedure.',
          content: content.trim(),
          problems: problemList,
          solutions: solutionList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit knowledge');
      }

      setSubmitted(true);
      setPendingReview(Boolean(data.pendingApproval));
      setTimeout(() => {
        router.push(user?.role === 'EMPLOYEE' ? '/dashboard' : '/knowledge');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-1.5 text-xs text-vault-dim hover:text-vault-text transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Knowledge Base
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-vault-text tracking-tight">
                Submit Technical Knowledge
              </h1>
              <p className="text-xs text-vault-muted mt-0.5">
                Codify critical architectural decisions, runbooks, or operational edge cases.
              </p>
            </div>
          </div>
        </div>

        {/* Governance Notice for Employees */}
        {user?.role === 'EMPLOYEE' && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-vault-text">Manager Review Required</span>
              <p className="text-vault-muted leading-relaxed">
                As an engineer, your submission will be routed to your manager (Sarah Lin) in the
                Review Queue. Once verified, it will be codified into the organizational knowledge graph.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-8 rounded-2xl bg-vault-surface border border-vault-border text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-vault-text">
              {pendingReview ? 'Submitted for Manager Review' : 'Knowledge Successfully Published'}
            </h3>
            <p className="text-xs text-vault-muted max-w-sm mx-auto">
              {pendingReview
                ? 'Your knowledge item has been added to Sarah Lin’s review queue and is pending technical validation.'
                : 'Your knowledge item has been embedded and indexed into the organizational memory graph.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-vault-surface border border-vault-border space-y-5">
            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">
                Procedure / Knowledge Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chase Paymentech 3D-Secure Gateway Failover Heuristic"
                className="w-full bg-vault-dark border border-vault-border rounded-lg px-3.5 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">Knowledge Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-vault-dark border border-vault-border rounded-lg px-3 py-2 text-xs text-vault-text focus:outline-none focus:border-indigo-500"
                >
                  <option value="TROUBLESHOOTING">Troubleshooting Runbook</option>
                  <option value="ARCHITECTURE">Architecture Design</option>
                  <option value="PROCESS">Operational Process</option>
                  <option value="BUSINESS_RULE">Business Rule</option>
                  <option value="EDGE_CASE">Edge Case</option>
                  <option value="VENDOR_DEPENDENCY">Vendor Dependency</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">Continuity Risk</label>
                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  className="w-full bg-vault-dark border border-vault-border rounded-lg px-3 py-2 text-xs text-vault-text focus:outline-none focus:border-indigo-500"
                >
                  <option value="CRITICAL">Critical (SPOF)</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">Associated Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-vault-dark border border-vault-border rounded-lg px-3 py-2 text-xs text-vault-text focus:outline-none focus:border-indigo-500"
                >
                  <option value="cmuk9c89800014yebt84g8dsa">Checkout & Payments Core</option>
                  <option value="cmuk9c8a400034yeb3qff4tva">NovaAnalytics & Event Bus</option>
                  <option value="cmuk9c8ba000a4yebx5m70e5b">Identity & Customer Portal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">
                Why It Matters (Continuity Rationale)
              </label>
              <input
                type="text"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                placeholder="e.g. Prevents silent payment drops during Black Friday flash sales."
                className="w-full bg-vault-dark border border-vault-border rounded-lg px-3.5 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">
                Summary (TL;DR for AI Assistant)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief 1-2 sentence operational summary"
                className="w-full bg-vault-dark border border-vault-border rounded-lg px-3.5 py-2 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-vault-muted block mb-1.5">
                Exact Procedure / Heuristics / Documentation *
              </label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe exact commands, configurations, threshold values, and recovery steps..."
                className="w-full bg-vault-dark border border-vault-border rounded-lg p-3 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">
                  Failure Symptoms (One per line)
                </label>
                <textarea
                  rows={3}
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  placeholder="e.g. HTTP 504 gateway timeout&#10;Stripe webhook queue backlog > 1000"
                  className="w-full bg-vault-dark border border-vault-border rounded-lg p-2.5 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-vault-muted block mb-1.5">
                  Verified Solutions (One per line)
                </label>
                <textarea
                  rows={3}
                  value={solutions}
                  onChange={(e) => setSolutions(e.target.value)}
                  placeholder="e.g. Run payment-cli failover --force&#10;Restart webhook listener with env flag"
                  className="w-full bg-vault-dark border border-vault-border rounded-lg p-2.5 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-vault-border flex items-center justify-end gap-3">
              <Link
                href="/knowledge"
                className="px-4 py-2 rounded-lg text-xs font-medium text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Submitting...'
                    : user?.role === 'EMPLOYEE'
                    ? 'Submit for Manager Review'
                    : 'Publish to Knowledge Base'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
