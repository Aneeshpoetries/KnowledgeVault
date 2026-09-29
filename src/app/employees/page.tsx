'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, User, ChevronRight, LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch((err) => console.error('Failed to load employees:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Employees &amp; Tacit Concentration
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Map organizational knowledge ownership across staff to prevent single points of failure.
            </p>
          </div>
        </div>

        {/* Clean Grid of Employee Profiles (Section 31) */}
        {loading ? (
          <div className="py-24 text-center text-vault-dim font-mono text-xs">
            Loading personnel profiles...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const concentration = Math.round(emp.concentrationRatio || 50);
              const coverage = Math.round(emp.knowledgeCoverage || 54);

              return (
                <div
                  key={emp.id}
                  className="p-5 rounded-xl bg-vault-surface border border-vault-border hover:border-vault-border/90 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-semibold text-xs text-indigo-400">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/employees/${emp.id}`}
                            className="text-sm font-semibold text-vault-text hover:text-indigo-400 transition-colors"
                          >
                            {emp.name}
                          </Link>
                          <p className="text-[11px] text-vault-dim">{emp.role}</p>
                        </div>
                      </div>
                      <RiskBadge risk={emp.riskLevel} />
                    </div>

                    <p className="text-xs text-vault-muted line-clamp-2 leading-relaxed">
                      {emp.bio || 'Core engineering contributor holding key system architectural knowledge.'}
                    </p>

                    {/* Knowledge Concentration Bar */}
                    <div className="space-y-1 pt-2 border-t border-vault-border/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-vault-dim">Knowledge Concentration</span>
                        <span className="font-mono font-medium text-vault-text">{concentration}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-vault-border overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            concentration >= 70
                              ? 'bg-amber-500'
                              : concentration >= 50
                              ? 'bg-cyan-400'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${concentration}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-vault-border/60 flex items-center justify-between text-xs">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="text-vault-dim hover:text-vault-text font-medium transition-colors"
                    >
                      View Profile
                    </Link>

                    <Link
                      href={`/exit-mode/${emp.id}`}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      <span>Exit Recovery</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
