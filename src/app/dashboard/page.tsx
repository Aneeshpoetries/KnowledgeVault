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
  CheckSquare,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  FolderGit2,
  ShieldCheck,
  Send,
  PlusCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, TypeBadge } from '@/components/ui/Badges';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { TimelinePulse } from '@/components/ui/TimelinePulse';
import { KnowledgeLineageMap } from '@/components/ui/KnowledgeLineageMap';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const role: UserRole = (user?.role || 'ADMIN') as UserRole;

  if (role === 'MANAGER') {
    return <ManagerDashboard user={user} />;
  }
  if (role === 'EMPLOYEE') {
    return <EmployeeDashboard user={user} />;
  }
  if (role === 'NEW_EMPLOYEE') {
    return <NewEmployeeDashboard user={user} />;
  }
  return <AdminDashboard user={user} />;
}

/* =========================================================================
   1. ADMIN DASHBOARD: Organizational Memory & Continuity Command
   ========================================================================= */
function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    overallCoverage: number;
    totalItems: number;
    criticalGaps: number;
    atRiskEmployees: number;
    pendingReviewsCount: number;
    employees: any[];
    gaps: any[];
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [covRes, itemsRes, empRes, gapsRes, revRes] = await Promise.all([
          fetch('/api/coverage'),
          fetch('/api/knowledge'),
          fetch('/api/employees'),
          fetch('/api/gaps'),
          fetch('/api/reviews').catch(() => ({ json: () => ({ items: [] }) })),
        ]);

        const covData = await covRes.json();
        const itemsData = await itemsRes.json();
        const empData = await empRes.json();
        const gapsData = await gapsRes.json();
        const revData = await revRes.json();

        const items = itemsData.items || [];
        const employees = empData.employees || [];
        const gaps = gapsData.gaps || [];
        const reviews = revData.items || [];

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
          pendingReviewsCount: reviews.length,
          employees,
          gaps,
        });
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const overall = data?.overallCoverage ?? 74;
  const capturedRatio = Math.max(10, overall);
  const atRiskRatio = Math.min(25, Math.round((100 - capturedRatio) * 0.45));
  const missingRatio = 100 - capturedRatio - atRiskRatio;

  const continuityRisks = [
    {
      risk: 'CRITICAL',
      entity: 'Payment System',
      detail: 'Core Banking API & Stripe Webhooks',
      concentration: 'Rahul Sharma · 73%',
      coverage: 54,
      actionHref: '/exit-mode',
      actionLabel: 'Inspect Risk',
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
      actionHref: '/projects',
      actionLabel: 'Inspect',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Organization Director View
              </span>
              <span className="text-[11px] text-vault-dim">· Marcus Vance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text mt-1">
              Organizational Memory & Continuity Command
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Organization-wide resilience telemetry, tacit knowledge concentration, and governance.
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
              <span>Exit Mode Engine</span>
            </Link>
          </div>
        </div>

        {/* Pending Review Alert Banner */}
        {data && data.pendingReviewsCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-vault-text block">
                  {data.pendingReviewsCount} Knowledge Submissions Awaiting Manager Approval
                </span>
                <span className="text-[11px] text-vault-muted">
                  Technical knowledge from departing staff and engineers must be verified before indexing.
                </span>
              </div>
            </div>
            <Link
              href="/reviews"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium transition-colors shrink-0"
            >
              Open Review Queue →
            </Link>
          </div>
        )}

        {/* Hero Continuity Visualization */}
        <div className="p-6 sm:p-8 rounded-xl bg-vault-surface border border-vault-border relative overflow-hidden">
          <div className="absolute inset-0 vault-grid-pattern pointer-events-none opacity-40" />
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono tracking-widest uppercase text-vault-dim mb-4">
              NovaTech Institutional Resilience Score
            </span>
            <div className="my-2">
              <CoverageRing
                score={overall}
                size={200}
                strokeWidth={10}
                label="CONTINUITY"
                sublabel="Retained Memory"
              />
            </div>
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

        {/* Three Compact Insights */}
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
                <span>Require immediate capture</span>
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
                <span>Rahul Sharma · Exit Pending</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <Users className="w-6 h-6 text-vault-dim opacity-40 shrink-0" />
          </div>
        </div>

        {/* Horizontal Memory Pulse */}
        <TimelinePulse />

        {/* AI Continuity Insight Area */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-vault-surface via-vault-surface to-vault-surface border border-indigo-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                  AI Continuity Telemetry
                </span>
                <p className="text-sm font-medium text-vault-text mt-1 leading-snug">
                  Payment troubleshooting is heavily concentrated around Rahul Sharma (Staff Infra). Only 54%
                  of troubleshooting procedures are verified in docs.
                </p>
                <p className="text-xs text-vault-dim mt-1">
                  Exit Mode session has recovered 4 items. Review queue has 3 procedures awaiting Sarah Lin's signoff.
                </p>
              </div>
            </div>

            <Link
              href="/exit-mode"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shrink-0"
            >
              <span>Inspect Exit Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Lineage Map */}
        <KnowledgeLineageMap />

        {/* Single Points of Failure Registry */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-vault-text">Continuity Risks & SPOFs</h3>
              <p className="text-xs text-vault-muted">
                Systems with high tacit concentration and single-person dependency
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
                  {continuityRisks.map((item) => (
                    <tr key={item.entity} className="vault-hover-row">
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

/* =========================================================================
   2. MANAGER DASHBOARD: Core Engineering Team Governance
   ========================================================================= */
function ManagerDashboard({ user }: { user: any }) {
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [coverageData, setCoverageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManagerData() {
      try {
        const [revRes, covRes] = await Promise.all([
          fetch('/api/reviews'),
          fetch('/api/coverage'),
        ]);
        const revData = await revRes.json();
        const covData = await covRes.json();
        setReviewItems(revData.items || []);
        setCoverageData(covData);
      } catch (err) {
        console.error('Failed to load manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadManagerData();
  }, []);

  const handleQuickApprove = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      if (res.ok) {
        setReviewItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {}
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-vault-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Engineering Manager View
              </span>
              <span className="text-[11px] text-vault-dim">· Sarah Lin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text mt-1">
              Core Engineering Team Dashboard
            </h1>
            <p className="text-xs text-vault-muted mt-0.5">
              Knowledge retention, direct reports continuity risk, and technical review approvals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Review Queue ({reviewItems.length})</span>
            </Link>
            <Link
              href="/exit-mode"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:bg-vault-subtle text-xs font-medium text-vault-text transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Manage Exit Recovery</span>
            </Link>
          </div>
        </div>

        {/* Manager Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Team Coverage</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-vault-text">68%</span>
              <span className="text-[11px] text-amber-400 font-mono">At-risk zone</span>
            </div>
            <p className="text-[11px] text-vault-muted">Core payments & checkout systems</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Pending Approvals</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{reviewItems.length}</span>
              <span className="text-[11px] text-vault-dim">from direct reports</span>
            </div>
            <p className="text-[11px] text-vault-muted">Submissions awaiting signoff</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Direct Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-vault-text">2</span>
              <span className="text-[11px] text-rose-400 font-mono">1 Exit Pending</span>
            </div>
            <p className="text-[11px] text-vault-muted">Rahul Sharma, Alex Chen</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Critical Team Gaps</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-400">2</span>
              <span className="text-[11px] text-vault-dim">unwritten</span>
            </div>
            <p className="text-[11px] text-vault-muted">Payment failover & webhook retry</p>
          </div>
        </div>

        {/* Pending Review Queue Component */}
        <div className="p-5 rounded-2xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-vault-text">
                Pending Team Technical Reviews ({reviewItems.length})
              </h2>
            </div>
            <Link href="/reviews" className="text-xs text-indigo-400 hover:underline font-medium">
              View all reviews →
            </Link>
          </div>

          {reviewItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-vault-dim">
              All knowledge items submitted by your direct reports have been approved.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-vault-dark border border-vault-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PENDING APPROVAL
                      </span>
                      <TypeBadge type={item.type} />
                      <RiskBadge risk={item.risk} />
                    </div>
                    <h3 className="text-xs font-semibold text-vault-text">{item.title}</h3>
                    <p className="text-[11px] text-vault-muted line-clamp-1">{item.whyItMatters}</p>
                    <span className="text-[10px] text-vault-dim font-mono">
                      Author: {item.employee?.name || 'Rahul Sharma'} · Submitted {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/reviews"
                      className="px-3 py-1.5 rounded-lg border border-vault-border text-xs text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
                    >
                      Inspect
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(item.id, item.title)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Reports Continuity Status Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-vault-text">Direct Reports Continuity Status</h3>
              <p className="text-xs text-vault-muted">
                Engineers reporting to Sarah Lin · Tacit concentration & onboarding status
              </p>
            </div>
            <Link href="/employees" className="text-xs text-indigo-400 hover:underline">
              View team directory →
            </Link>
          </div>

          <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vault-border/60 bg-vault-dark text-[11px] font-mono uppercase tracking-wider text-vault-dim">
                  <th className="py-2.5 px-4 font-normal">Engineer</th>
                  <th className="py-2.5 px-4 font-normal">Lifecycle Status</th>
                  <th className="py-2.5 px-4 font-normal">Concentration</th>
                  <th className="py-2.5 px-4 font-normal">Coverage</th>
                  <th className="py-2.5 px-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/40">
                <tr className="vault-hover-row">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-vault-text">Rahul Sharma</div>
                    <div className="text-[11px] text-vault-dim">Staff Infrastructure Engineer</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      EXIT PENDING (2 WEEKS)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-semibold">
                    73% (CRITICAL SPOF)
                  </td>
                  <td className="py-3 px-4 font-mono text-vault-text">
                    54%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/exit-mode"
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span>Manage Exit Mode</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>

                <tr className="vault-hover-row">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-vault-text">Alex Chen</div>
                    <div className="text-[11px] text-vault-dim">Junior Developer</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ONBOARDING (DAY 12)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-vault-dim">
                    12% (LOW)
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    82% Ramp
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/employees"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================================
   3. EMPLOYEE DASHBOARD: Rahul Sharma (Staff Infra, EXIT_PENDING)
   ========================================================================= */
function EmployeeDashboard({ user }: { user: any }) {
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployeeData() {
      try {
        const res = await fetch('/api/knowledge?status=ALL');
        const data = await res.json();
        setMyItems(data.items || []);
      } catch (err) {
        console.error('Failed to load employee knowledge items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployeeData();
  }, []);

  const pendingCount = myItems.filter((i) => i.status === 'PENDING_REVIEW').length;
  const approvedCount = myItems.filter((i) => i.status === 'APPROVED' || i.status === 'VERIFIED').length;

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-vault-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Staff Engineer View
              </span>
              <span className="text-[11px] text-vault-dim">· Rahul Sharma</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text mt-1">
              My Knowledge & Technical Ownership
            </h1>
            <p className="text-xs text-vault-muted mt-0.5">
              Core Banking API, Stripe Webhooks, and Infrastructure Continuity Management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/knowledge/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border hover:bg-vault-subtle text-xs font-medium text-vault-text transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Submit Runbook</span>
            </Link>
            <Link
              href="/exit-mode"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium transition-all shadow-sm font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Continue Exit Interview →</span>
            </Link>
          </div>
        </div>

        {/* Prominent Exit Knowledge Transfer Banner */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-vault-text">
                  Active Knowledge Transfer in Progress (Exit Mode)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">
                  FINAL 2 WEEKS
                </span>
              </div>
              <p className="text-xs text-vault-muted mt-1 leading-relaxed">
                You have {pendingCount || 3} procedures currently in review by Sarah Lin, and 3 critical runbook
                questions remaining in your interview session. Codifying these troubleshooting steps ensures the team
                can resolve payment incidents without escalation.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-500/20">
            <Link
              href="/exit-mode"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Answer Targeted Questions in Exit Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Employee Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Authored Records</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-vault-text">{myItems.length || 14}</span>
              <span className="text-[11px] text-emerald-400 font-mono">{approvedCount} Indexed</span>
            </div>
            <p className="text-[11px] text-vault-muted">Verified institutional memory</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">In Review Queue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{pendingCount || 3}</span>
              <span className="text-[11px] text-vault-dim">awaiting manager</span>
            </div>
            <p className="text-[11px] text-vault-muted">Submitted to Sarah Lin</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">My Continuity Coverage</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-vault-text">54%</span>
              <span className="text-[11px] text-amber-400 font-mono">Target: 80%</span>
            </div>
            <p className="text-[11px] text-vault-muted">Troubleshooting coverage low</p>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-1">
            <span className="text-xs text-vault-dim">Assigned Exit Questions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-400">3</span>
              <span className="text-[11px] text-vault-dim">remaining</span>
            </div>
            <p className="text-[11px] text-vault-muted">Payment failover & settlement</p>
          </div>
        </div>

        {/* My Authored Knowledge Items */}
        <div className="p-5 rounded-2xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
            <div>
              <h2 className="text-sm font-semibold text-vault-text">My Knowledge Contributions</h2>
              <p className="text-xs text-vault-muted">
                Runbooks, architectural decisions, and operational troubleshooting records authored by you.
              </p>
            </div>
            <Link href="/knowledge" className="text-xs text-indigo-400 hover:underline">
              Browse all records →
            </Link>
          </div>

          <div className="divide-y divide-vault-border/40">
            {myItems.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        item.status === 'APPROVED' || item.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                    <TypeBadge type={item.type} />
                    <RiskBadge risk={item.risk} />
                  </div>
                  <h3 className="text-xs font-semibold text-vault-text">{item.title}</h3>
                  <p className="text-[11px] text-vault-muted line-clamp-1">{item.whyItMatters}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/knowledge/${item.id}`}
                    className="px-3 py-1 rounded-lg border border-vault-border text-xs text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors"
                  >
                    View Record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================================
   4. NEW EMPLOYEE DASHBOARD: Alex Chen (Junior Dev, Onboarding)
   ========================================================================= */
function NewEmployeeDashboard({ user }: { user: any }) {
  const starterQuestions = [
    'How do I run the payment settlement batch locally?',
    'What is our retry protocol for Chase Paymentech 3D-Secure timeouts?',
    'Where is the Stripe webhook signing secret configured in staging?',
    'Who is the technical owner of the Kafka Dead Letter Queue router?',
  ];

  const curatedGuides = [
    {
      title: 'Checkout & Payments Core Architecture Overview',
      type: 'ARCHITECTURE',
      risk: 'MEDIUM',
      author: 'Rahul Sharma',
      desc: 'High-level overview of payment tokenization, gateway orchestration, and idempotency guarantees.',
    },
    {
      title: 'Chase Paymentech Gateway Timeout & Failover Heuristics',
      type: 'TROUBLESHOOTING',
      risk: 'CRITICAL',
      author: 'Rahul Sharma',
      desc: 'Exact operational steps when Chase Paymentech 3D-Secure drops transactions under burst traffic.',
    },
    {
      title: 'Stripe Webhook Event Processing & Idempotency Key Rules',
      type: 'RUNBOOK',
      risk: 'HIGH',
      author: 'Rahul Sharma',
      desc: 'Handling out-of-order charge.succeeded and customer.subscription.deleted events safely.',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-vault-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                New Hire Onboarding
              </span>
              <span className="text-[11px] text-vault-dim">· Alex Chen</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text mt-1">
              Welcome to NovaTech, Alex
            </h1>
            <p className="text-xs text-vault-muted mt-0.5">
              Junior Developer · Checkout & Payments Engineering Team · Day 12
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Nova Continuity AI</span>
            </Link>
          </div>
        </div>

        {/* 30-60-90 Day Ramp Progress */}
        <div className="p-5 rounded-2xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                Onboarding Roadmap
              </span>
              <h2 className="text-sm font-semibold text-vault-text mt-0.5">
                Phase 1: Architecture Ramp & Local Environment Setup
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              82% Completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-vault-dark overflow-hidden border border-vault-border/60">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-[82%]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-vault-dark border border-vault-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-vault-text">Days 1 - 30</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-vault-dim">
                Checkout architecture ramp-up, local Docker test suites, verified runbooks.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-vault-dark/50 border border-vault-border/40 space-y-1 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-vault-text">Days 31 - 60</span>
                <Clock className="w-3.5 h-3.5 text-vault-dim" />
              </div>
              <p className="text-[11px] text-vault-dim">
                First production PR: Webhook retry idempotency check & integration tests.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-vault-dark/50 border border-vault-border/40 space-y-1 opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-vault-text">Days 61 - 90</span>
                <Clock className="w-3.5 h-3.5 text-vault-dim" />
              </div>
              <p className="text-[11px] text-vault-dim">
                On-call shadow rotation with senior engineers; production alerts response.
              </p>
            </div>
          </div>
        </div>

        {/* Curated Onboarding Knowledge */}
        <div className="p-5 rounded-2xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
            <div>
              <h2 className="text-sm font-semibold text-vault-text">
                Essential Reading for Checkout & Payments
              </h2>
              <p className="text-xs text-vault-muted">
                Curated verified knowledge items authored by outgoing Staff Engineers to ramp you up quickly.
              </p>
            </div>
            <Link href="/knowledge" className="text-xs text-indigo-400 hover:underline">
              View all guides →
            </Link>
          </div>

          <div className="space-y-3">
            {curatedGuides.map((guide, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-vault-dark border border-vault-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-vault-border transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={guide.type} />
                    <RiskBadge risk={guide.risk} />
                    <span className="text-[10px] text-vault-dim font-mono">Author: {guide.author}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-vault-text">{guide.title}</h3>
                  <p className="text-[11px] text-vault-muted">{guide.desc}</p>
                </div>
                <Link
                  href="/knowledge"
                  className="px-3 py-1.5 rounded-lg border border-vault-border text-xs text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors shrink-0"
                >
                  Read Guide
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Ask Nova AI Starter Questions */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-vault-surface via-vault-surface to-vault-surface border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-vault-text">
              Have questions? Ask Nova Continuity AI
            </h3>
          </div>
          <p className="text-xs text-vault-muted">
            The assistant searches verified organizational memory and Rahul's codified runbooks directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {starterQuestions.map((q, idx) => (
              <Link
                key={idx}
                href={`/assistant?q=${encodeURIComponent(q)}`}
                className="p-3 rounded-lg bg-vault-dark border border-vault-border/60 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-xs text-vault-muted hover:text-vault-text flex items-center justify-between group"
              >
                <span className="truncate pr-2">"{q}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-vault-dim group-hover:text-indigo-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Team Mentors & Points of Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold shrink-0">
              SL
            </div>
            <div>
              <span className="text-xs font-semibold text-vault-text block">Sarah Lin</span>
              <span className="text-[11px] text-vault-dim font-mono">Engineering Manager · Team Lead</span>
              <p className="text-[11px] text-vault-muted mt-0.5">Direct manager for 1:1s, roadmap, and reviews</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-vault-surface border border-vault-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center text-xs font-semibold shrink-0">
              RS
            </div>
            <div>
              <span className="text-xs font-semibold text-vault-text block">Rahul Sharma</span>
              <span className="text-[11px] text-vault-dim font-mono">Staff Infrastructure Engineer · Tech Mentor</span>
              <p className="text-[11px] text-vault-muted mt-0.5">Author of Payments Core & Webhooks runbooks</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
