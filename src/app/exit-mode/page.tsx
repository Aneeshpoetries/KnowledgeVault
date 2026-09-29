'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  User,
  LogOut,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';

export default function ExitModeHubPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch((err) => console.error('Failed to load employees:', err))
      .finally(() => setLoading(false));
  }, []);

  const rahul = employees.find((e) => e.name.includes('Rahul')) || employees[0];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Knowledge Recovery
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Targeted offboarding interviews to recover tacit experience and eliminate single points of failure.
            </p>
          </div>
        </div>

        {/* Featured Subject: Rahul Sharma (Section 26) */}
        {rahul && (
          <div className="p-6 sm:p-8 rounded-xl bg-vault-surface border border-vault-border relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    High Continuity Risk Case
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-vault-text">
                    {rahul.name} · {rahul.role}
                  </h2>
                  <p className="text-xs sm:text-sm text-vault-muted mt-1 leading-relaxed">
                    Rahul holds <strong className="text-vault-text font-normal font-mono">73% of Payment System tacit knowledge</strong>. He is the sole responder to midnight settlement incidents and third-party webhook timeout cascades.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-xs max-w-md">
                  <div className="p-3 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-vault-dim block text-[10px] font-mono">Current Coverage</span>
                    <span className="text-base font-semibold font-mono text-cyan-400">
                      {rahul.knowledgeCoverage || 54}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-vault-dim block text-[10px] font-mono">Undocumented Gaps</span>
                    <span className="text-base font-semibold font-mono text-red-400">4 Critical</span>
                  </div>
                  <div className="p-3 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-vault-dim block text-[10px] font-mono">Concentration</span>
                    <span className="text-base font-semibold font-mono text-amber-400">73% Single-Pt</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-2 w-full lg:w-auto">
                <Link
                  href={`/exit-mode/${rahul.id}`}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-medium text-white transition-all shadow-glowIndigo"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Start Knowledge Recovery Session</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <span className="text-[10px] text-vault-dim font-mono">
                  Adaptive AI Interview · Instant Coverage Update
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Staff Roster: Retention & Continuity Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vault-text">Key Personnel Continuity Audit</h3>
            <span className="text-xs text-vault-dim font-mono">{employees.length} contributors</span>
          </div>

          <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vault-border/60 bg-vault-dark text-[11px] font-mono uppercase tracking-wider text-vault-dim">
                    <th className="py-2.5 px-4 font-normal">Employee</th>
                    <th className="py-2.5 px-4 font-normal">Primary Systems</th>
                    <th className="py-2.5 px-4 font-normal">Tacit Concentration</th>
                    <th className="py-2.5 px-4 font-normal">Coverage</th>
                    <th className="py-2.5 px-4 font-normal">Risk</th>
                    <th className="py-2.5 px-4 font-normal text-right">Interview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border/40">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="vault-hover-row">
                      <td className="py-3 px-4">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-medium text-vault-text hover:text-indigo-400 transition-colors"
                        >
                          {emp.name}
                        </Link>
                        <p className="text-[11px] text-vault-dim">{emp.role}</p>
                      </td>
                      <td className="py-3 px-4 text-vault-muted">
                        {emp.projectAssignments
                          ?.map((pa: any) => pa.project?.name)
                          .filter(Boolean)
                          .join(', ') || 'Core Platform'}
                      </td>
                      <td className="py-3 px-4 font-mono text-vault-text">
                        {emp.concentrationRatio || 45}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-[100px]">
                          <div className="flex-1 h-1.5 rounded-full bg-vault-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${emp.knowledgeCoverage || 50}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-vault-text">
                            {emp.knowledgeCoverage || 50}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge risk={emp.riskLevel} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/exit-mode/${emp.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>Interview</span>
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
