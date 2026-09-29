'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Brain,
  ShieldAlert,
  CheckCircle2,
  FolderGit2,
  Cpu,
  ArrowRight,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, KnowledgeTypeBadge, ConfidenceBadge } from '@/components/ui/Badges';
import { CoverageRing } from '@/components/ui/CoverageRing';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load employee:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Loading employee profile...
        </div>
      </AppShell>
    );
  }

  if (!data?.employee) {
    return (
      <AppShell>
        <div className="p-12 text-center text-vault-dim">
          <p className="text-sm font-medium text-vault-text">Employee not found</p>
          <Link href="/employees" className="mt-2 text-xs text-indigo-400 hover:underline inline-block">
            ← Return to directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const emp = data.employee;
  const concentration = Math.round(emp.concentrationRatio || 73);
  const coverage = Math.round(emp.knowledgeCoverage || 54);

  // Section 31: Knowledge Ownership Breakdown across systems
  const ownershipDistribution = [
    { system: 'Payment System', ratio: 73, color: 'bg-indigo-500' },
    { system: 'Analytics Platform', ratio: 18, color: 'bg-cyan-400' },
    { system: 'Customer Portal', ratio: 9, color: 'bg-amber-400' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to personnel roster</span>
          </Link>

          <Link
            href={`/exit-mode/${emp.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Launch Exit Recovery</span>
          </Link>
        </div>

        {/* Hero Profile (Section 31) */}
        <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-lg font-semibold text-indigo-400 shrink-0">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
                    {emp.name}
                  </h1>
                  <RiskBadge risk={emp.riskLevel} />
                </div>
                <p className="text-xs text-vault-dim mt-0.5">{emp.role} · {emp.department}</p>
                <p className="text-xs text-vault-muted mt-2 max-w-xl leading-relaxed">
                  {emp.bio || 'Core engineering contributor holding key system architectural knowledge.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <CoverageRing
                score={coverage}
                size={130}
                strokeWidth={7}
                label="COVERAGE"
                sublabel="Retained"
              />
            </div>
          </div>

          {/* Section 31: Knowledge Ownership Visualization */}
          <div className="pt-4 border-t border-vault-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                Knowledge Ownership Concentration
              </span>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                {concentration}% Overall Single-Point Dependency
              </span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-2.5 rounded-full bg-vault-dark overflow-hidden flex">
              {ownershipDistribution.map((item) => (
                <div
                  key={item.system}
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${item.ratio}%` }}
                  title={`${item.system}: ${item.ratio}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-vault-dim pt-1">
              {ownershipDistribution.map((item) => (
                <div key={item.system} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-vault-text">{item.system}</span>
                  <span className="text-vault-dim">{item.ratio}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Items Authored / Owned */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vault-text">
              Operational Memory Items ({emp.knowledgeItems?.length || 0})
            </h3>
            <span className="text-xs text-vault-dim font-mono">Verified procedural artifacts</span>
          </div>

          <div className="rounded-xl border border-vault-border bg-vault-surface divide-y divide-vault-border/40">
            {emp.knowledgeItems?.length === 0 ? (
              <div className="p-8 text-center text-xs text-vault-dim">
                No formalized knowledge records yet. Conduct an exit interview to capture tacit workflows.
              </div>
            ) : (
              emp.knowledgeItems?.map((it: any) => (
                <Link
                  key={it.id}
                  href={`/knowledge/${it.id}`}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 vault-hover-row"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <KnowledgeTypeBadge type={it.type} />
                      <h4 className="text-xs sm:text-sm font-semibold text-vault-text truncate">{it.title}</h4>
                    </div>
                    <p className="text-xs text-vault-muted line-clamp-1">{it.summary || it.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge risk={it.risk} />
                    <ConfidenceBadge confidence={it.confidence} />
                    <ChevronRight className="w-4 h-4 text-vault-dim" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
