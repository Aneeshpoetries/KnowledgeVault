'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  HelpCircle,
  Plus,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';
import { useAuth } from '@/context/AuthContext';
import { offlineGaps } from '@/lib/offline-demo';
import { demoGaps, saveDemoGaps } from '@/lib/demo-store';

export default function KnowledgeGapsPage() {
  const { user } = useAuth();
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchGaps = async () => {
    setLoading(true);
    if (user?.id?.startsWith('demo-')) {
      setGaps(demoGaps());
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/gaps');
      if (!res.ok) throw new Error('Gap data unavailable');
      const data = await res.json();
      setGaps(data.gaps || []);
    } catch (err) {
      console.error('Failed to load gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchGaps();
  }, [user?.id]);

  const handleGenerateQuestions = async (gapId: string) => {
    setGeneratingId(gapId);
    if (user?.id?.startsWith('demo-')) {
      const next = demoGaps().map(gap => gap.id === gapId ? { ...gap, suggestedQuestionsJson: JSON.stringify([`What happens when ${gap.title.toLowerCase()} occurs?`, 'Which checks come first, and who verifies recovery?']) } : gap);
      saveDemoGaps(next);
      setGaps(next);
      setGeneratingId(null);
      return;
    }
    try {
      const res = await fetch('/api/gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gapId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGaps((prev) =>
          prev.map((g) =>
            g.id === gapId
              ? {
                  ...g,
                  suggestedQuestionsJson: JSON.stringify(
                    data.questions.map((q: any) => q.question)
                  ),
                }
              : g
          )
        );
      }
    } catch {
      alert('Failed to generate AI questions');
    } finally {
      setGeneratingId(null);
    }
  };

  const criticalGaps = gaps.filter((g) => g.impact === 'CRITICAL');
  const highGaps = gaps.filter((g) => g.impact === 'HIGH');
  const mediumGaps = gaps.filter((g) => g.impact !== 'CRITICAL' && g.impact !== 'HIGH');

  const renderGapCard = (gap: any) => {
    const questions = gap.suggestedQuestionsJson
      ? JSON.parse(gap.suggestedQuestionsJson)
      : [];

    return (
      <div
        key={gap.id}
        className="p-6 rounded-3xl bg-vault-surface border border-vault-border space-y-4 vault-hover-row"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RiskBadge risk={gap.impact} />
              <span className="text-[10px] font-mono uppercase text-vault-dim">
                {gap.category || 'Troubleshooting'}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-vault-text">{gap.title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/exit-mode?focus=${encodeURIComponent(gap.title)}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Investigate with an interview</span>
            </Link>
          </div>
        </div>

        {/* Why missing & Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-vault-border/60 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-0.5">
              Why it matters
            </span>
            <p className="text-vault-muted leading-relaxed">
              {gap.description ||
                'Undocumented tacit procedure executed by senior engineer during outages without runbook transcription.'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-0.5">
              Operational Impact
            </span>
            <p className="text-vault-muted leading-relaxed">
              {gap.impact === 'CRITICAL'
                ? 'Severe service downtime if primary contributor departs; MTTR increases from 15 min to >3 hours.'
                : 'Increased escalation overhead and trial-and-error debugging during off-hours.'}
            </p>
          </div>
        </div>

        {/* Suggested Owner & AI Question */}
        <div className="pt-2 border-t border-vault-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-vault-dim font-mono">
            <User className="w-3.5 h-3.5 text-vault-dim" />
            <span>
              Suggested Owner:{' '}
              <strong className="text-vault-text font-medium">Rahul Sharma</strong>
            </span>
          </div>

          <div>
            {questions.length > 0 ? (
              <span className="text-[11px] text-indigo-400 italic font-sans truncate max-w-md block">
                &ldquo;{questions[0]}&rdquo;
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleGenerateQuestions(gap.id)}
                disabled={generatingId === gap.id}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {generatingId === gap.id ? 'Generating prompts...' : 'Generate AI question'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Section 25: Missing Memory Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              What&apos;s missing?
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              KnowledgeVault continuously identifies knowledge the organization should know but hasn&apos;t captured yet.
            </p>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capture Missing Knowledge</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-vault-dim font-mono text-xs">
            Scanning organizational memory for gaps...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Critical Priority Section */}
            {criticalGaps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-vault-text">
                    Critical Priority ({criticalGaps.length})
                  </h2>
                </div>
                <div className="space-y-3">{criticalGaps.map(renderGapCard)}</div>
              </div>
            )}

            {/* High Priority Section */}
            {highGaps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-vault-text">
                    High Priority ({highGaps.length})
                  </h2>
                </div>
                <div className="space-y-3">{highGaps.map(renderGapCard)}</div>
              </div>
            )}

            {/* Medium Priority Section */}
            {mediumGaps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-vault-text">
                    Medium Priority ({mediumGaps.length})
                  </h2>
                </div>
                <div className="space-y-3">{mediumGaps.map(renderGapCard)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
