'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  FolderGit2,
  ChevronRight,
  ShieldAlert,
  Send,
  Sparkles,
  RefreshCw,
  FileText,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { AccessForbidden } from '@/components/ui/AccessForbidden';
import { RiskBadge, TypeBadge } from '@/components/ui/Badges';
import { offlineKnowledge } from '@/lib/offline-demo';
import { demoReviews, saveDemoReviews } from '@/lib/demo-store';

const demoReviewItems = offlineKnowledge.map((item, index) => ({
  ...item,
  status: 'PENDING_REVIEW',
  createdAt: `2026-10-0${7 - index}T09:00:00.000Z`,
}));

export default function ReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{
    itemId: string;
    itemTitle: string;
    action: 'REQUEST_CHANGES' | 'REJECT';
  } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviewItems = async () => {
    setLoading(true);
    if (user?.id?.startsWith('demo-')) {
      setItems(demoReviews());
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?.role === 'ADMIN' || user?.role === 'MANAGER')) {
      fetchReviewItems();
    }
  }, [authLoading, user?.role]);

  const handleApprove = async (id: string, title: string) => {
    setProcessingId(id);
    setMessage(null);
    if (user?.id?.startsWith('demo-')) {
      const next = demoReviews().filter(item => item.id !== id);
      saveDemoReviews(next);
      setItems(next);
      setMessage({ type: 'success', text: `Approved and indexed "${title}" into organizational memory.` });
      setProcessingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Approved and indexed "${title}" into organizational memory.` });
        await fetchReviewItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to approve item' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error approving item' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleModalSubmit = async () => {
    if (!activeModal) return;
    if (!reasonText.trim()) {
      alert('Please provide a reason or required changes.');
      return;
    }

    setProcessingId(activeModal.itemId);
    setMessage(null);
    if (user?.id?.startsWith('demo-')) {
      const next = demoReviews().filter(item => item.id !== activeModal.itemId);
      saveDemoReviews(next);
      setItems(next);
      setMessage({
        type: 'success',
        text: activeModal.action === 'REQUEST_CHANGES'
          ? `Changes requested for "${activeModal.itemTitle}".`
          : `Rejected "${activeModal.itemTitle}".`,
      });
      setActiveModal(null);
      setReasonText('');
      setProcessingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${activeModal.itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeModal.action,
          reason: reasonText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text:
            activeModal.action === 'REQUEST_CHANGES'
              ? `Changes requested for "${activeModal.itemTitle}". Author has been notified.`
              : `Rejected "${activeModal.itemTitle}".`,
        });
        setActiveModal(null);
        setReasonText('');
        await fetchReviewItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit review' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error during review' });
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-vault-dim text-xs">
          Loading review permissions...
        </div>
      </AppShell>
    );
  }

  // Access control guard: Only ADMIN and MANAGER have access
  if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return (
      <AppShell>
        <AccessForbidden
          title="Review Queue Restricted"
          message="This knowledge is outside your workspace. Only Managers and Administrators have governance review privileges."
          requiredRole="Manager or Administrator"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-vault-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <CheckSquare className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-semibold text-vault-text tracking-tight">
                Knowledge Review Center
              </h1>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {items.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-vault-muted mt-1">
              Technical validation and governance queue for employee knowledge submissions before indexing.
            </p>
          </div>

          <button
            onClick={fetchReviewItems}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:bg-vault-subtle text-xs text-vault-muted hover:text-vault-text transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-150 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-vault-dim hover:text-vault-text text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Review Queue Items */}
        {loading ? (
          <div className="py-20 text-center text-vault-dim text-xs">
            Loading pending technical reviews...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 rounded-2xl bg-vault-surface border border-vault-border text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-vault-text">Review Queue Cleared</h3>
            <p className="text-xs text-vault-muted max-w-sm mx-auto">
              All knowledge submissions from your team have been verified and codified into institutional memory.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isProcessing = processingId === item.id;
              const authorName = item.employee?.name || item.createdByEmployee?.name || 'Staff Engineer';
              const authorRole = item.employee?.role || 'Engineer';
              const problems = item.problemsJson ? JSON.parse(item.problemsJson) : [];
              const solutions = item.solutionsJson ? JSON.parse(item.solutionsJson) : [];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-vault-surface border border-vault-border space-y-4 shadow-subtle hover:border-vault-border/90 transition-all"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {item.status.replace('_', ' ')}
                        </span>
                        <TypeBadge type={item.type} />
                        <RiskBadge risk={item.risk} />
                        {item.project && (
                          <span className="text-[11px] text-vault-dim font-mono flex items-center gap-1">
                            <FolderGit2 className="w-3 h-3 text-vault-dim" />
                            {item.project.name}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-semibold text-vault-text tracking-tight">
                        {item.title}
                      </h2>
                    </div>

                    {/* Author Meta */}
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-vault-dark border border-vault-border/60 shrink-0 text-left">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold">
                        {authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="leading-none">
                        <span className="text-xs font-medium text-vault-text block">
                          {authorName}
                        </span>
                        <span className="text-[10px] text-vault-dim font-mono mt-0.5 block">
                          {authorRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Why It Matters */}
                  <div className="p-3 rounded-lg bg-vault-dark/40 border border-vault-border/60 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                      Continuity Impact Rationale
                    </span>
                    <p className="text-vault-muted leading-relaxed">{item.whyItMatters}</p>
                  </div>

                  {/* Summary & Content */}
                  <div className="space-y-2 text-xs">
                    <p className="text-vault-text font-medium">{item.summary}</p>
                    <div className="p-3 rounded-lg bg-vault-subtle/40 border border-vault-border/40 font-mono text-[11px] text-vault-muted whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </div>
                  </div>

                  {/* Problems & Solutions if present */}
                  {(problems.length > 0 || solutions.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      {problems.length > 0 && (
                        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-1">
                          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
                            Known Operational Failure Modes
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-vault-muted text-[11px]">
                            {problems.map((p: string, idx: number) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {solutions.length > 0 && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                            Verified Mitigations & Recovery
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-vault-muted text-[11px]">
                            {solutions.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-vault-border/60">
                    <div className="flex items-center gap-2 text-[11px] text-vault-dim font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Submitted {new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.reviewNotes && (
                        <span className="text-amber-400">· Previous notes: {item.reviewNotes}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActiveModal({
                            itemId: item.id,
                            itemTitle: item.title,
                            action: 'REJECT',
                          })
                        }
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          setActiveModal({
                            itemId: item.id,
                            itemTitle: item.title,
                            action: 'REQUEST_CHANGES',
                          })
                        }
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, item.title)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isProcessing ? 'Indexing...' : 'Approve & Index'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Feedback Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-vault-surface border border-vault-border space-y-4 shadow-elevated animate-in fade-in zoom-in-95 duration-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                {activeModal.action === 'REQUEST_CHANGES' ? 'Request Revisions' : 'Reject Submission'}
              </span>
              <h3 className="text-base font-semibold text-vault-text mt-1">
                {activeModal.itemTitle}
              </h3>
              <p className="text-xs text-vault-muted mt-1">
                {activeModal.action === 'REQUEST_CHANGES'
                  ? 'Specify what context, edge cases, or verification details the engineer must revise.'
                  : 'Explain why this knowledge item is being rejected or declined.'}
              </p>
            </div>

            <textarea
              rows={4}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={
                activeModal.action === 'REQUEST_CHANGES'
                  ? 'e.g. Please clarify step 3 regarding redis cluster failover timeout...'
                  : 'e.g. Redundant with existing gateway documentation...'
              }
              className="w-full bg-vault-dark border border-vault-border rounded-lg p-3 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-vault-border">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setReasonText('');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={!reasonText.trim()}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50 ${
                  activeModal.action === 'REQUEST_CHANGES'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
