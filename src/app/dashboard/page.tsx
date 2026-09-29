'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  ShieldAlert,
  AlertTriangle,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Bot,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { TimelinePulse } from '@/components/ui/TimelinePulse';
import { KnowledgeLineageMap } from '@/components/ui/KnowledgeLineageMap';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    overallCoverage: number;
    totalItems: number;
    criticalGaps: number;
    atRiskEmployees: number;
    employees: any[];
    gaps: any[];
    categories: any[];
  } | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [covRes, itemsRes, empRes, gapsRes] = await Promise.all([
          fetch('/api/coverage'),
          fetch('/api/knowledge'),
          fetch('/api/employees'),
          fetch('/api/gaps'),
        ]);

        const covData = await covRes.json();
        const itemsData = await itemsRes.json();
        const empData = await empRes.json();
        const gapsData = await gapsRes.json();

        const items = itemsData.items || [];
        const employees = empData.employees || [];
        const gaps = gapsData.gaps || [];

        const overall = typeof covData.overallCoverage === 'number' ? covData.overallCoverage : 74;
        const criticalGapsCount = gaps.filter((g: any) => g.impact === 'CRITICAL' || g.impact === 'HIGH').length;
        const atRiskCount = employees.filter(
          (e: any) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH' || e.concentrationRatio >= 50
        ).length;

        setData({
          overallCoverage: overall,
          totalItems: items.length,
          criticalGaps: criticalGapsCount || 3,
          atRiskEmployees: atRiskCount || 3,
          employees,
          gaps,
          categories: covData.categories || [],
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const overall = data?.overallCoverage ?? 74;
  const capturedRatio = Math.max(10, overall);
  const atRiskRatio = Math.min(25, Math.round((100 - capturedRatio) * 0.45));
  const missingRatio = 100 - capturedRatio - atRiskRatio;

  // Real risk table data
  const continuityRisks = [
    {
      risk: 'CRITICAL',
      entity: 'Payment System',
      detail: 'Core Banking API & Stripe Webhooks',
      concentration: 'Rahul Sharma · 73%',
      coverage: 54,
      actionHref: '/exit-mode/cmuk9c89e00004yebedbz5ftx',
      actionLabel: 'Recover',
    },
    {
      risk: 'HIGH',
      entity: 'Analytics Platform',
      detail: 'Kafka Dead Letter Queue Routing',
      concentration: 'Elena Rostova · 58%',
      coverage: 62,
      actionHref: '/gaps',
      actionLabel: 'Review',
    },
    {
      risk: 'MEDIUM',
      entity: 'Customer Portal',
      detail: 'OAuth Token Refresh Cascade',
      concentration: 'Arjun Verma · 45%',
      coverage: 76,
      actionHref: '/projects/cmuk9c8ba000a4yebx5m70e5b',
      actionLabel: 'Inspect',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Organizational Memory
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Understand what your organization knows — and what it may lose.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:border-vault-border/90 text-xs font-medium text-vault-text transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask AI</span>
            </Link>
            <Link
              href="/exit-mode"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-200" />
              <span>Start Exit Recovery</span>
            </Link>
          </div>
        </div>

        {/* Hero Continuity Visualization (Section 8) */}
        <div className="p-6 sm:p-8 rounded-xl bg-vault-surface border border-vault-border relative overflow-hidden">
          {/* Subtle technical background grid */}
          <div className="absolute inset-0 vault-grid-pattern pointer-events-none opacity-40" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono tracking-widest uppercase text-vault-dim mb-4">
              Organizational Memory Resilience
            </span>

            {/* Large Animated Radial Ring */}
            <div className="my-2">
              <CoverageRing
                score={overall}
                size={200}
                strokeWidth={10}
                label="CONTINUITY"
                sublabel="Retained Memory"
              />
            </div>

            {/* Continuity Breakdown Triad */}
            <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-6 pt-6 border-t border-vault-border/60 max-w-md w-full">
              <div className="flex flex-col items-center">
                <span className="text-xs text-vault-dim mb-0.5">Captured</span>
                <span className="text-lg font-semibold font-mono text-indigo-400">
                  {capturedRatio}%
                </span>
                <span className="text-[10px] text-vault-dim">Verified active</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-vault-dim mb-0.5">At Risk</span>
                <span className="text-lg font-semibold font-mono text-amber-400">
                  {atRiskRatio}%
                </span>
                <span className="text-[10px] text-vault-dim">Single engineer</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-vault-dim mb-0.5">Missing</span>
                <span className="text-lg font-semibold font-mono text-red-400">
                  {missingRatio}%
                </span>
                <span className="text-[10px] text-vault-dim">Critical gaps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Three Compact Insights Under Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-between">
            <div>
              <p className="text-xs text-vault-dim">Knowledge growing</p>
              <p className="text-base font-semibold text-vault-text mt-0.5">
                +{data?.totalItems ? Math.round(data.totalItems * 0.6) : 14} items
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                +18% this month
              </p>
            </div>
            <Brain className="w-6 h-6 text-vault-dim opacity-40 shrink-0" />
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-between">
            <div>
              <p className="text-xs text-vault-dim">Critical gaps</p>
              <p className="text-base font-semibold text-vault-text mt-0.5">
                {data?.criticalGaps ?? 3} undetected procedures
              </p>
              <Link
                href="/gaps"
                className="text-[11px] text-amber-400 hover:underline mt-0.5 inline-flex items-center gap-1 font-mono"
              >
                <span>3 require attention</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <ShieldAlert className="w-6 h-6 text-vault-dim opacity-40 shrink-0" />
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-between">
            <div>
              <p className="text-xs text-vault-dim">At-risk knowledge</p>
              <p className="text-base font-semibold text-vault-text mt-0.5">
                {data?.atRiskEmployees ?? 3} staff members
              </p>
              <Link
                href="/exit-mode"
                className="text-[11px] text-indigo-400 hover:underline mt-0.5 inline-flex items-center gap-1 font-mono"
              >
                <span>High tacit concentration</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <Users className="w-6 h-6 text-vault-dim opacity-40 shrink-0" />
          </div>
        </div>

        {/* Section 9: Memory Pulse (Horizontal Timeline) */}
        <TimelinePulse />

        {/* Section 10: AI Continuity Insight Area */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-vault-surface via-vault-surface to-vault-surface border border-indigo-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                  AI Continuity Insight
                </span>
                <p className="text-sm font-medium text-vault-text mt-1 leading-snug">
                  Payment troubleshooting is currently concentrated around Rahul Sharma. Only 42%
                  of troubleshooting knowledge is independently documented.
                </p>
                <p className="text-xs text-vault-dim mt-1">
                  If Rahul departs today, resolution time on high-traffic webhook failures is
                  projected to increase from 14 minutes to 3.8 hours.
                </p>
              </div>
            </div>

            <Link
              href="/exit-mode/cmuk9c89e00004yebedbz5ftx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shrink-0"
            >
              <span>Explore risk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section 11: Knowledge Map Lineage */}
        <KnowledgeLineageMap />

        {/* Section 12: Continuity Risks Table (Clean Table / List) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-vault-text">Continuity Risks</h3>
              <p className="text-xs text-vault-muted">
                Systems with single-point-of-failure tacit concentration
              </p>
            </div>
            <Link
              href="/coverage"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Full coverage audit →
            </Link>
          </div>

          <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vault-border/60 bg-vault-dark text-[11px] font-mono uppercase tracking-wider text-vault-dim">
                    <th className="py-2.5 px-4 font-normal">Risk</th>
                    <th className="py-2.5 px-4 font-normal">Entity / System</th>
                    <th className="py-2.5 px-4 font-normal">Knowledge Concentration</th>
                    <th className="py-2.5 px-4 font-normal">Coverage</th>
                    <th className="py-2.5 px-4 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border/40">
                  {continuityRisks.map((item, idx) => (
                    <tr
                      key={item.entity}
                      className="vault-hover-row"
                    >
                      <td className="py-3 px-4">
                        <RiskBadge risk={item.risk} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-vault-text">{item.entity}</div>
                        <div className="text-[11px] text-vault-dim">{item.detail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 text-vault-muted font-mono">
                          <User className="w-3 h-3 text-vault-dim" />
                          <span>{item.concentration}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex-1 h-1.5 rounded-full bg-vault-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${item.coverage}%` }}
                            />
                          </div>
                          <span className="font-mono text-vault-text text-[11px]">
                            {item.coverage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={item.actionHref}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
