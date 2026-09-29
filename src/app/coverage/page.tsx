'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PieChart,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  Plus,
  LogOut,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';

export default function CoveragePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/coverage')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.categories && json.categories.length > 0) {
          // Select Troubleshooting by default if present
          const tb = json.categories.find((c: any) => c.category.includes('Troubleshoot')) || json.categories[0];
          setSelectedCategory(tb);
        }
      })
      .catch((err) => console.error('Failed to load coverage:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Computing organizational continuity health...
        </div>
      </AppShell>
    );
  }

  const overall = data.overallCoverage ?? 74;

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Continuity Health
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Continuity diagnostic across 8 critical operational dimensions.
            </p>
          </div>

          <Link
            href="/exit-mode"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Launch Exit Recovery</span>
          </Link>
        </div>

        {/* Section 23: Continuity Health Top Hero & Horizontal Spectrum */}
        <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-vault-dim block mb-1">
                Overall Health Score
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-semibold font-mono tracking-tight text-vault-text">
                  {overall}%
                </span>
                <span className="text-xs text-vault-muted max-w-sm">
                  Your organization currently retains most critical architecture, but has single-engineer concentration in troubleshooting and edge cases.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-vault-dim shrink-0">
              <span>{data.totalCapturedItems} items verified</span>
              <span>·</span>
              <span className="text-amber-400">{data.criticalGapsCount} critical gaps</span>
            </div>
          </div>

          {/* Horizontal Spectrum Bar: Strong ───────────── Weak */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-vault-dim">
              <span>Strong Continuity (100%)</span>
              <span>Baseline (50%)</span>
              <span>Critical Risk (0%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-vault-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-500 transition-all duration-1000"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Category Breakdown & Detailed Inspector (Section 24) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Categories List (cols 7) */}
          <div className="lg:col-span-7 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
              Operational Categories
            </span>

            <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden divide-y divide-vault-border/40">
              {data.categories?.map((cat: any) => {
                const isSelected = selectedCategory?.category === cat.category;
                const score = cat.score ?? 50;

                return (
                  <div
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3.5 vault-hover-row cursor-pointer flex items-center justify-between gap-4 transition-colors ${
                      isSelected ? 'bg-vault-subtle/80' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-vault-text">
                          {cat.category}
                        </span>
                        <span className="text-xs font-mono font-medium text-vault-text">
                          {score}%
                        </span>
                      </div>

                      {/* Thin elegant progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-vault-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            score >= 70
                              ? 'bg-indigo-500'
                              : score >= 45
                              ? 'bg-cyan-400'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-vault-dim mt-1.5">
                        <span>{cat.capturedItemsCount || 0} captured</span>
                        <span>·</span>
                        <span>{cat.expectedItemsCount || 0} target</span>
                        <span>·</span>
                        <span className={score < 50 ? 'text-amber-400' : 'text-emerald-400'}>
                          {cat.status || (score < 50 ? 'CRITICAL_GAP' : 'ADEQUATE')}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-vault-dim">
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Inspector Drawer (Section 24) (cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
              Category Diagnostic
            </span>

            {selectedCategory ? (
              <div className="p-5 rounded-xl bg-vault-surface border border-vault-border space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
                  <div>
                    <h3 className="text-sm font-semibold text-vault-text">
                      {selectedCategory.category}
                    </h3>
                    <p className="text-xs text-vault-dim mt-0.5">
                      Retention Score: <strong className="text-vault-text font-mono">{selectedCategory.score}%</strong>
                    </p>
                  </div>
                  <RiskBadge
                    risk={selectedCategory.score < 40 ? 'CRITICAL' : selectedCategory.score < 60 ? 'HIGH' : 'MEDIUM'}
                  />
                </div>

                {/* What is captured */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                    What is captured
                  </span>
                  <p className="text-xs text-vault-muted leading-relaxed">
                    {selectedCategory.capturedItemsCount > 0
                      ? `${selectedCategory.capturedItemsCount} verified runbooks covering standard deployment and architecture baselines.`
                      : 'No independent operational artifacts logged in this category.'}
                  </p>
                </div>

                {/* What is missing */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                    What is missing
                  </span>
                  <p className="text-xs text-vault-muted leading-relaxed">
                    {selectedCategory.score < 60
                      ? 'Detailed incident recovery procedures, secret rotation overrides, and third-party webhook failure patterns.'
                      : 'Edge case exceptions and undocumented dependency overrides.'}
                  </p>
                </div>

                {/* Why it matters */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                    Why it matters
                  </span>
                  <p className="text-xs text-vault-muted leading-relaxed">
                    Without structured documentation, incident triage during off-hours will stall or require escalating to departed engineers.
                  </p>
                </div>

                {/* Who can fill the gap */}
                <div className="p-3 rounded-lg bg-vault-dark border border-vault-border space-y-1 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                    Key Subject Matter Expert
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-vault-text">Rahul Sharma</span>
                    <span className="text-[10px] font-mono text-amber-400">Sole Responder</span>
                  </div>
                </div>

                {/* Suggested AI Question */}
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggested AI Recovery Question
                  </span>
                  <p className="text-xs text-vault-text font-medium italic">
                    &ldquo;What production issues are hardest to diagnose when third-party services fail under peak load?&rdquo;
                  </p>
                </div>

                {/* Action button */}
                <Link
                  href="/capture"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-glowIndigo"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Knowledge Capture</span>
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-vault-dim border border-vault-border rounded-xl">
                Select a category on the left to inspect continuity health.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
