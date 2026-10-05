'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, ShieldAlert, Users, Sparkles, ArrowRight, TrendingUp,
  Bot, LogOut, ChevronRight, User, CheckSquare, Clock, BookOpen,
  CheckCircle2, FolderGit2, PlusCircle, BarChart2, Activity,
  AlertTriangle, FileText, Layers, Network,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, TypeBadge } from '@/components/ui/Badges';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { TimelinePulse } from '@/components/ui/TimelinePulse';
import { KnowledgeLineageMap } from '@/components/ui/KnowledgeLineageMap';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

/* ─── Shared Pastel Stat Card ─────────────────────────────────── */
function StatCard({
  color, icon: Icon, label, value, sub, href,
}: { color: string; icon: any; label: string; value: string; sub: string; href?: string }) {
  const content = (
    <div className={`${color} rounded-[1.5rem] p-5 flex flex-col gap-4 group hover:scale-[1.02] transition-transform shadow-sm cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-800/80">
          <span className="w-6 h-6 bg-black/8 rounded-full flex items-center justify-center">
            <Icon size={12} className="text-gray-700" />
          </span>
          {label}
        </div>
        <ArrowRight size={12} className="text-gray-600/40 group-hover:text-gray-700 transition-colors" />
      </div>
      <div>
        <div className="text-[22px] font-bold tracking-tight text-gray-900 mb-1">{value}</div>
        <div className="text-[11px] text-gray-700/70 font-medium">{sub}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

/* ─── Section Header ───────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, action, actionHref }: { icon: any; title: string; action?: string; actionHref?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-vault-text rounded-full flex items-center justify-center text-vault-dark shadow-sm">
          <Icon size={16} />
        </div>
        <h2 className="font-bold text-[15px] text-vault-text">{title}</h2>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="text-[12px] font-semibold text-vault-muted hover:text-vault-text transition-colors flex items-center gap-1">
          {action} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ─── Warm Panel wrapper ────────────────────────────────────────── */
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-vault-surface-2 rounded-[2rem] p-6 shadow-card border border-vault-border ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role: UserRole = (user?.role || 'ADMIN') as UserRole;

  if (role === 'MANAGER')     return <ManagerDashboard user={user} />;
  if (role === 'EMPLOYEE')    return <EmployeeDashboard user={user} />;
  if (role === 'NEW_EMPLOYEE')return <NewEmployeeDashboard user={user} />;
  return <AdminDashboard user={user} />;
}

/* =========================================================================
   1. ADMIN DASHBOARD
   ========================================================================= */
function AdminDashboard({ user }: { user: any }) {
  // Phase 1: Fast data — visible immediately (~200-400ms)
  const [fastData, setFastData] = useState<{
    totalItems: number; pendingReviewsCount: number;
  } | null>(null);

  // Phase 2: Heavy data — loads after fast data renders (~800-2000ms)
  const [heavyData, setHeavyData] = useState<{
    overallCoverage: number; criticalGaps: number; atRiskEmployees: number; gaps: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Wave 1: Light & fast — render the page skeleton with real numbers ──
    async function loadFast() {
      try {
        const [itemsRes, revRes] = await Promise.all([
          fetch('/api/knowledge', { cache: 'default' }),
          fetch('/api/reviews',   { cache: 'default' }).catch(() => null),
        ]);
        const itemsData = await itemsRes.json();
        const revData   = revRes ? await revRes.json() : { items: [] };
        setFastData({
          totalItems:          (itemsData.items || []).length,
          pendingReviewsCount: (revData.items   || []).length,
        });
      } catch (err) {
        console.error('Fast load failed:', err);
        setFastData({ totalItems: 0, pendingReviewsCount: 0 });
      } finally {
        setLoading(false); // Unblock render immediately
      }
    }

    // ── Wave 2: Heavy — loads in background, updates stats when ready ──
    async function loadHeavy() {
      try {
        const [covRes, gapsRes, empRes] = await Promise.all([
          fetch('/api/coverage',   { cache: 'default' }),
          fetch('/api/gaps',       { cache: 'default' }),
          fetch('/api/employees',  { cache: 'default' }),
        ]);
        const covData  = await covRes.json();
        const gapsData = await gapsRes.json();
        const empData  = await empRes.json();

        const gaps      = gapsData.gaps      || [];
        const employees = empData.employees  || [];
        const overall   = typeof covData.overallCoverage === 'number' ? covData.overallCoverage : 74;

        setHeavyData({
          overallCoverage:  overall,
          criticalGaps:     gaps.filter((g: any) => g.impact === 'CRITICAL' || g.impact === 'HIGH').length || 3,
          atRiskEmployees:  employees.filter((e: any) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH' || e.concentrationRatio >= 50).length || 3,
          gaps,
        });
      } catch (err) {
        console.error('Heavy load failed:', err);
        setHeavyData({ overallCoverage: 74, criticalGaps: 3, atRiskEmployees: 3, gaps: [] });
      }
    }

    loadFast().then(() => loadHeavy()); // Heavy starts after fast finishes
  }, []);

  // Merge fast + heavy into one view object (heavy data replaces placeholders when ready)
  const overall       = heavyData?.overallCoverage ?? 74;
  const capturedRatio = Math.max(10, overall);
  const atRiskRatio   = Math.min(25, Math.round((100 - capturedRatio) * 0.45));
  const missingRatio  = 100 - capturedRatio - atRiskRatio;

  const continuityRisks = [
    { risk: 'CRITICAL', entity: 'Payment System',     detail: 'Core Banking API & Stripe Webhooks',        concentration: 'Rahul Sharma · 73%', coverage: 54, actionHref: '/exit-mode', actionLabel: 'Inspect Risk' },
    { risk: 'HIGH',     entity: 'Analytics Platform', detail: 'Kafka Dead Letter Queue Routing',           concentration: 'Elena Rostova · 58%', coverage: 62, actionHref: '/gaps',     actionLabel: 'Review' },
    { risk: 'MEDIUM',   entity: 'Customer Portal',    detail: 'OAuth Token Refresh Cascade',               concentration: 'Arjun Verma · 45%',  coverage: 76, actionHref: '/projects', actionLabel: 'Inspect' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-role-admin">
                Organization Director
              </span>
              <span className="text-[12px] text-vault-dim font-medium">· Marcus Vance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">Organizational Memory Command</h1>
            <p className="text-[13px] text-vault-muted mt-1">
              Organization-wide resilience telemetry, knowledge concentration, and governance.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/assistant" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-surface border border-vault-border hover:bg-vault-subtle text-[13px] font-semibold text-vault-text transition-colors shadow-card">
              <Bot className="w-4 h-4 text-[#C8A2F9]" />Ask AI
            </Link>
            <Link href="/exit-mode" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-text text-vault-dark text-[13px] font-bold transition-all shadow-card hover:opacity-85">
              <LogOut className="w-4 h-4" />Exit Mode Engine
            </Link>
          </div>
        </div>

        {/* Pending Review Alert */}
        {fastData && fastData.pendingReviewsCount > 0 && (
          <div className="p-4 rounded-3xl bg-[#F8D4A7]/40 border border-[#F8D4A7]/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F8D4A7] flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4 text-[#7a5510]" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-vault-text block">
                  {fastData.pendingReviewsCount} Knowledge Submissions Awaiting Approval
                </span>
                <span className="text-[11px] text-vault-muted">
                  Technical knowledge from departing staff must be verified before indexing.
                </span>
              </div>
            </div>
            <Link href="/reviews" className="px-4 py-2 rounded-2xl bg-[#F8D4A7] hover:bg-[#f5c98a] text-[#7a5510] text-[12px] font-bold transition-colors shrink-0 shadow-sm">
              Open Queue →
            </Link>
          </div>
        )}

        {/* Coverage Hero + Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Coverage Ring Panel */}
          <Panel className="xl:col-span-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-vault-dim mb-3">
              NovaTech Resilience Score
            </span>
            <CoverageRing score={overall} size={180} strokeWidth={10} label="CONTINUITY" sublabel="Retained Memory" />
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-vault-border w-full">
              {[
                { label: 'Captured', value: `${capturedRatio}%`, color: 'text-[#7C6AF7]' },
                { label: 'At Risk',  value: `${atRiskRatio}%`,   color: 'text-[#F8BFA5]' },
                { label: 'Missing',  value: `${missingRatio}%`,  color: 'text-[#F391AC]' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <span className="text-[10px] text-vault-dim mb-0.5 font-medium">{item.label}</span>
                  <span className={`text-[18px] font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Stat Cards Grid */}
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard color="bg-[#F8D4A7]" icon={Brain} label="Knowledge Items"
              value={loading ? '—' : String(fastData?.totalItems ?? 47)} sub="+18% this month" href="/knowledge" />
            <StatCard color="bg-[#A0C4F6]" icon={ShieldAlert} label="Critical Gaps"
              value={heavyData ? String(heavyData.criticalGaps) : '—'} sub="Undetected procedures" href="/gaps" />
            <StatCard color="bg-[#C8A2F9]" icon={Users} label="At-Risk Staff"
              value={heavyData ? String(heavyData.atRiskEmployees) : '—'} sub="Single-engineer dependency" href="/exit-mode" />
            <StatCard color="bg-[#F8BFA5]" icon={CheckSquare} label="Pending Reviews"
              value={loading ? '—' : String(fastData?.pendingReviewsCount ?? 0)} sub="Awaiting manager signoff" href="/reviews" />
            <StatCard color="bg-[#F59ED5]" icon={FolderGit2} label="Active Projects"
              value="8" sub="Under knowledge capture" href="/projects" />
            <StatCard color="bg-[#F391AC]" icon={Activity} label="Continuity Score"
              value={heavyData ? `${overall}%` : '—'} sub="Organizational memory" href="/coverage" />
          </div>
        </div>

        {/* Timeline Pulse */}
        <TimelinePulse />

        {/* AI Continuity Insight */}
        <Panel>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-[#C8A2F9]/20 border border-[#C8A2F9]/30 flex items-center justify-center text-[#7C6AF7] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C6AF7]">AI Continuity Telemetry</span>
                <p className="text-[13px] font-semibold text-vault-text mt-1 leading-snug">
                  Payment troubleshooting is heavily concentrated around Rahul Sharma. Only 54%
                  of troubleshooting procedures are verified in docs.
                </p>
                <p className="text-[12px] text-vault-muted mt-1">
                  Exit Mode session has recovered 4 items. Review queue has 3 procedures awaiting Sarah Lin's signoff.
                </p>
              </div>
            </div>
            <Link href="/exit-mode" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#C8A2F9]/15 hover:bg-[#C8A2F9]/25 text-[#7C6AF7] border border-[#C8A2F9]/30 text-[12px] font-bold transition-all shrink-0">
              Inspect Exit Mode <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Panel>

        {/* Lineage Map */}
        <KnowledgeLineageMap />

        {/* Continuity Risks Table */}
        <Panel>
          <SectionHeader icon={ShieldAlert} title="Continuity Risks & SPOFs" action="Full coverage audit" actionHref="/coverage" />
          <div className="overflow-x-auto rounded-2xl border border-vault-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vault-border bg-vault-subtle text-[11px] font-bold uppercase tracking-wider text-vault-dim">
                  <th className="py-3 px-4 font-semibold">Risk</th>
                  <th className="py-3 px-4 font-semibold">Entity / System</th>
                  <th className="py-3 px-4 font-semibold">Knowledge Concentration</th>
                  <th className="py-3 px-4 font-semibold">Coverage</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border">
                {continuityRisks.map((item) => (
                  <tr key={item.entity} className="vault-hover-row">
                    <td className="py-3.5 px-4"><RiskBadge risk={item.risk} /></td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-vault-text text-[13px]">{item.entity}</div>
                      <div className="text-[11px] text-vault-dim mt-0.5">{item.detail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-vault-muted">
                        <User className="w-3 h-3 text-vault-dim" />
                        <span className="text-[12px] font-medium">{item.concentration}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="flex-1 h-1.5 rounded-full bg-vault-border overflow-hidden">
                          <div className="h-full rounded-full bg-[#A0C4F6]" style={{ width: `${item.coverage}%` }} />
                        </div>
                        <span className="font-bold text-vault-text text-[11px]">{item.coverage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={item.actionHref} className="inline-flex items-center gap-1 text-[12px] font-bold text-vault-muted hover:text-vault-text transition-colors">
                        {item.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

/* =========================================================================
   2. MANAGER DASHBOARD
   ========================================================================= */
function ManagerDashboard({ user }: { user: any }) {
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadManagerData() {
      try {
        const [revRes] = await Promise.all([fetch('/api/reviews')]);
        const revData = await revRes.json();
        setReviewItems(revData.items || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadManagerData();
  }, []);

  const handleQuickApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      if (res.ok) setReviewItems((prev) => prev.filter((item) => item.id !== id));
    } catch {}
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-role-manager">
                Engineering Manager
              </span>
              <span className="text-[12px] text-vault-dim font-medium">· Sarah Lin</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">Core Engineering Team Dashboard</h1>
            <p className="text-[13px] text-vault-muted mt-1">
              Knowledge retention, direct reports continuity risk, and technical review approvals.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/reviews" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-text text-vault-dark text-[13px] font-bold transition-all shadow-card">
              <CheckSquare className="w-4 h-4" />Review Queue ({reviewItems.length})
            </Link>
            <Link href="/exit-mode" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-surface border border-vault-border hover:bg-vault-subtle text-[13px] font-semibold text-vault-text transition-colors shadow-card">
              <LogOut className="w-4 h-4 text-[#F8BFA5]" />Manage Exit Recovery
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard color="bg-[#A0C4F6]" icon={Activity}  label="Team Coverage"       value="68%"  sub="Core payments & checkout" />
          <StatCard color="bg-[#F8D4A7]" icon={CheckSquare} label="Pending Approvals" value={String(reviewItems.length)} sub="From direct reports" href="/reviews" />
          <StatCard color="bg-[#C8A2F9]" icon={Users}     label="Direct Reports"      value="2"    sub="1 Exit Pending" />
          <StatCard color="bg-[#F391AC]" icon={ShieldAlert} label="Critical Gaps"     value="2"    sub="Payment failover & webhook" href="/gaps" />
        </div>

        {/* Review Queue */}
        <Panel>
          <SectionHeader icon={CheckSquare} title={`Pending Team Reviews (${reviewItems.length})`} action="View all" actionHref="/reviews" />
          {reviewItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-vault-dim">
              ✓ All knowledge items submitted by your direct reports have been approved.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-vault-subtle border border-vault-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8D4A7] text-[#7a5510]">PENDING</span>
                      <TypeBadge type={item.type} />
                      <RiskBadge risk={item.risk} />
                    </div>
                    <h3 className="text-[13px] font-bold text-vault-text">{item.title}</h3>
                    <p className="text-[11px] text-vault-muted line-clamp-1">{item.whyItMatters}</p>
                    <span className="text-[10px] text-vault-dim font-medium">
                      Author: {item.employee?.name || 'Rahul Sharma'} · {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/reviews" className="px-3 py-1.5 rounded-2xl border border-vault-border text-[12px] font-semibold text-vault-muted hover:text-vault-text hover:bg-vault-surface transition-colors">
                      Inspect
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(item.id)}
                      className="px-3 py-1.5 rounded-2xl bg-[#A0C4F6] hover:bg-[#85b0ef] text-[#1a3f6b] text-[12px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Direct Reports Table */}
        <Panel>
          <SectionHeader icon={Users} title="Direct Reports Continuity Status" action="View team" actionHref="/employees" />
          <div className="overflow-x-auto rounded-2xl border border-vault-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vault-border bg-vault-subtle text-[11px] font-bold uppercase tracking-wider text-vault-dim">
                  <th className="py-3 px-4 font-semibold">Engineer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Concentration</th>
                  <th className="py-3 px-4 font-semibold">Coverage</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border">
                <tr className="vault-hover-row">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-vault-text text-[13px]">Rahul Sharma</div>
                    <div className="text-[11px] text-vault-dim">Staff Infrastructure Engineer</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F8BFA5]/40 text-[#7a3010]">EXIT PENDING (2 WEEKS)</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#F391AC] text-[12px]">73% (CRITICAL SPOF)</td>
                  <td className="py-3.5 px-4 font-bold text-vault-text text-[12px]">54%</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href="/exit-mode" className="inline-flex items-center gap-1 text-[12px] font-bold text-vault-muted hover:text-vault-text transition-colors">
                      Manage Exit <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
                <tr className="vault-hover-row">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-vault-text text-[13px]">Alex Chen</div>
                    <div className="text-[11px] text-vault-dim">Junior Developer</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#C8A2F9]/30 text-[#4a1a8b]">ONBOARDING (DAY 12)</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-vault-dim text-[12px]">12% (LOW)</td>
                  <td className="py-3.5 px-4 font-bold text-[#10B981] text-[12px]">82% Ramp</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href="/employees" className="inline-flex items-center gap-1 text-[12px] font-bold text-vault-muted hover:text-vault-text transition-colors">
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

/* =========================================================================
   3. EMPLOYEE DASHBOARD
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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadEmployeeData();
  }, []);

  const pendingCount  = myItems.filter((i) => i.status === 'PENDING_REVIEW').length;
  const approvedCount = myItems.filter((i) => i.status === 'APPROVED' || i.status === 'VERIFIED').length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-role-emp">
                Staff Engineer
              </span>
              <span className="text-[12px] text-vault-dim font-medium">· Rahul Sharma</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">My Knowledge & Technical Ownership</h1>
            <p className="text-[13px] text-vault-muted mt-1">Core Banking API, Stripe Webhooks, and Infrastructure Continuity.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/knowledge/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-surface border border-vault-border text-[13px] font-semibold text-vault-text transition-colors shadow-card">
              <PlusCircle className="w-4 h-4 text-[#C8A2F9]" />Submit Runbook
            </Link>
            <Link href="/exit-mode" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F8BFA5] hover:bg-[#f5ae88] text-[#7a3010] text-[13px] font-bold transition-all shadow-card">
              <LogOut className="w-4 h-4" />Continue Exit Interview →
            </Link>
          </div>
        </div>

        {/* Exit Banner */}
        <div className="p-5 rounded-3xl bg-[#F8BFA5]/30 border-2 border-[#F8BFA5]/60">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F8BFA5] flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-[#7a3010]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-bold text-vault-text">Active Knowledge Transfer in Progress (Exit Mode)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8BFA5] text-[#7a3010]">FINAL 2 WEEKS</span>
              </div>
              <p className="text-[12px] text-vault-muted leading-relaxed">
                You have {pendingCount || 3} procedures in review by Sarah Lin, and 3 critical runbook questions remaining.
                Codifying these ensures the team can resolve payment incidents without escalation.
              </p>
              <Link href="/exit-mode" className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-2xl bg-[#F8BFA5] hover:bg-[#f5ae88] text-[#7a3010] text-[12px] font-bold transition-colors">
                Answer Targeted Questions in Exit Mode <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard color="bg-[#F8D4A7]" icon={FileText}  label="Authored Records"  value={String(myItems.length || 14)} sub={`${approvedCount} Indexed`} />
          <StatCard color="bg-[#C8A2F9]" icon={Clock}     label="In Review Queue"   value={String(pendingCount || 3)}    sub="Awaiting manager" />
          <StatCard color="bg-[#A0C4F6]" icon={Activity}  label="Continuity Coverage" value="54%"                        sub="Target: 80%" href="/coverage" />
          <StatCard color="bg-[#F8BFA5]" icon={AlertTriangle} label="Exit Questions" value="3"                           sub="Remaining" href="/exit-mode" />
        </div>

        {/* Knowledge Items */}
        <Panel>
          <SectionHeader icon={Brain} title="My Knowledge Contributions" action="Browse all" actionHref="/knowledge" />
          {myItems.length === 0 && !loading ? (
            <div className="py-8 text-center text-[13px] text-vault-dim">No knowledge items yet. Submit your first runbook!</div>
          ) : (
            <div className="divide-y divide-vault-border">
              {myItems.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'APPROVED' || item.status === 'VERIFIED'
                          ? 'bg-[#A0C4F6]/30 text-[#1a3f6b]' : 'bg-[#F8D4A7]/50 text-[#7a5510]'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <TypeBadge type={item.type} />
                      <RiskBadge risk={item.risk} />
                    </div>
                    <h3 className="text-[13px] font-bold text-vault-text">{item.title}</h3>
                    <p className="text-[11px] text-vault-muted line-clamp-1">{item.whyItMatters}</p>
                  </div>
                  <Link href={`/knowledge/${item.id}`} className="px-3 py-1.5 rounded-2xl border border-vault-border text-[12px] font-semibold text-vault-muted hover:text-vault-text hover:bg-vault-subtle transition-colors shrink-0">
                    View Record
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

/* =========================================================================
   4. NEW EMPLOYEE DASHBOARD
   ========================================================================= */
function NewEmployeeDashboard({ user }: { user: any }) {
  const starterQuestions = [
    'How do I run the payment settlement batch locally?',
    'What is our retry protocol for Chase Paymentech 3D-Secure timeouts?',
    'Where is the Stripe webhook signing secret configured in staging?',
    'Who is the technical owner of the Kafka Dead Letter Queue router?',
  ];

  const curatedGuides = [
    { title: 'Checkout & Payments Core Architecture Overview', type: 'ARCHITECTURE', risk: 'MEDIUM', author: 'Rahul Sharma', desc: 'High-level overview of payment tokenization, gateway orchestration, and idempotency guarantees.' },
    { title: 'Chase Paymentech Gateway Timeout & Failover Heuristics', type: 'TROUBLESHOOTING', risk: 'CRITICAL', author: 'Rahul Sharma', desc: 'Exact operational steps when Chase Paymentech 3D-Secure drops transactions under burst traffic.' },
    { title: 'Stripe Webhook Event Processing & Idempotency Key Rules', type: 'RUNBOOK', risk: 'HIGH', author: 'Rahul Sharma', desc: 'Handling out-of-order charge.succeeded and customer.subscription.deleted events safely.' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-role-new">
                New Hire Onboarding
              </span>
              <span className="text-[12px] text-vault-dim font-medium">· Alex Chen</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-vault-text">Welcome to NovaTech, Alex 👋</h1>
            <p className="text-[13px] text-vault-muted mt-1">Junior Developer · Checkout & Payments Engineering · Day 12</p>
          </div>
          <Link href="/assistant" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-text text-vault-dark text-[13px] font-bold transition-all shadow-card self-start">
            <Bot className="w-4 h-4" />Ask Nova Continuity AI
          </Link>
        </div>

        {/* Onboarding Progress */}
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-vault-dim">Onboarding Roadmap</span>
              <h2 className="text-[15px] font-bold text-vault-text mt-0.5">Phase 1: Architecture Ramp & Local Environment Setup</h2>
            </div>
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-[#A0C4F6]/30 text-[#1a3f6b]">82% Completed</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-vault-subtle overflow-hidden border border-vault-border mb-5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#C8A2F9] to-[#A0C4F6] w-[82%] transition-all" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Days 1 – 30', desc: 'Checkout architecture ramp-up, local Docker test suites, verified runbooks.', done: true, color: 'bg-[#A0C4F6]/20 border-[#A0C4F6]/40' },
              { label: 'Days 31 – 60', desc: 'First production PR: Webhook retry idempotency check & integration tests.', done: false, color: 'bg-vault-subtle border-vault-border' },
              { label: 'Days 61 – 90', desc: 'On-call shadow rotation with senior engineers; production alerts response.', done: false, color: 'bg-vault-subtle border-vault-border' },
            ].map((phase) => (
              <div key={phase.label} className={`p-4 rounded-2xl border ${phase.color} ${!phase.done ? 'opacity-70' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-vault-text">{phase.label}</span>
                  {phase.done ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <Clock className="w-4 h-4 text-vault-dim" />}
                </div>
                <p className="text-[11px] text-vault-muted">{phase.desc}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Essential Reading */}
        <Panel>
          <SectionHeader icon={BookOpen} title="Essential Reading for Checkout & Payments" action="View all guides" actionHref="/knowledge" />
          <div className="space-y-3">
            {curatedGuides.map((guide, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-vault-subtle border border-vault-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-vault-border-hover transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TypeBadge type={guide.type} /><RiskBadge risk={guide.risk} />
                    <span className="text-[10px] text-vault-dim font-medium">by {guide.author}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-vault-text">{guide.title}</h3>
                  <p className="text-[11px] text-vault-muted">{guide.desc}</p>
                </div>
                <Link href="/knowledge" className="px-3 py-1.5 rounded-2xl border border-vault-border text-[12px] font-semibold text-vault-muted hover:text-vault-text hover:bg-vault-surface transition-colors shrink-0">
                  Read Guide
                </Link>
              </div>
            ))}
          </div>
        </Panel>

        {/* Ask Nova AI */}
        <Panel>
          <SectionHeader icon={Bot} title="Have Questions? Ask Nova Continuity AI" action="Open AI Assistant" actionHref="/assistant" />
          <p className="text-[12px] text-vault-muted mb-4">
            The assistant searches verified organizational memory and Rahul's codified runbooks directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {starterQuestions.map((q, idx) => (
              <Link
                key={idx}
                href={`/assistant?q=${encodeURIComponent(q)}`}
                className="p-3.5 rounded-2xl bg-vault-subtle border border-vault-border hover:border-[#C8A2F9]/50 hover:bg-[#C8A2F9]/8 transition-all text-[12px] text-vault-muted hover:text-vault-text flex items-center justify-between gap-2 group"
              >
                <span className="truncate">"{q}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-vault-dim group-hover:text-[#7C6AF7] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </Panel>

        {/* Team Mentors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { initials: 'SL', name: 'Sarah Lin', title: 'Engineering Manager · Team Lead', desc: 'Direct manager for 1:1s, roadmap, and reviews', color: 'bg-[#A0C4F6]' },
            { initials: 'RS', name: 'Rahul Sharma', title: 'Staff Infrastructure Engineer · Tech Mentor', desc: 'Author of Payments Core & Webhooks runbooks', color: 'bg-[#F8BFA5]' },
          ].map((mentor) => (
            <Panel key={mentor.name} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 ${mentor.color}`}>
                {mentor.initials}
              </div>
              <div>
                <span className="text-[14px] font-bold text-vault-text block">{mentor.name}</span>
                <span className="text-[11px] text-vault-dim">{mentor.title}</span>
                <p className="text-[11px] text-vault-muted mt-0.5">{mentor.desc}</p>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
