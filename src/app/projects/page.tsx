'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderGit2, ArrowRight, ChevronRight, Cpu } from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';
import { useAuth } from '@/context/AuthContext';
import { offlineProjects } from '@/lib/offline-demo';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.id.startsWith('demo-')) {
      setProjects(offlineProjects);
      setLoading(false);
      return;
    }
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch((err) => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Projects &amp; System Boundaries
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Service repositories, technological stacks, and continuity coverage health.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-vault-dim font-mono text-xs">
            Loading systems catalog...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((prj) => {
              const coverage = Math.round(prj.coverageScore || 54);

              return (
                <div
                  key={prj.id}
                  className="p-5 rounded-xl bg-vault-surface border border-vault-border hover:border-vault-border/90 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            href={`/projects/${prj.id}`}
                            className="text-sm font-semibold text-vault-text hover:text-emerald-400 transition-colors"
                          >
                            {prj.name}
                          </Link>
                          <p className="text-[10px] font-mono uppercase text-vault-dim">
                            {prj.department || 'Infrastructure'}
                          </p>
                        </div>
                      </div>
                      <RiskBadge risk={prj.riskLevel} />
                    </div>

                    <p className="text-xs text-vault-muted line-clamp-2 leading-relaxed">
                      {prj.description || 'Tier-1 operational service with active SLA dependencies.'}
                    </p>

                    {/* Coverage Bar */}
                    <div className="space-y-1 pt-2 border-t border-vault-border/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-vault-dim">Knowledge Coverage</span>
                        <span className="font-mono font-medium text-vault-text">{coverage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-vault-border overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            coverage >= 70
                              ? 'bg-emerald-500'
                              : coverage >= 50
                              ? 'bg-cyan-400'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>

                    {/* Technologies pills */}
                    {prj.technologies && prj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {prj.technologies.slice(0, 4).map((t: any) => (
                          <span
                            key={t.technology.id}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vault-dark border border-vault-border text-vault-dim"
                          >
                            {t.technology.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-vault-border/60">
                    <Link
                      href={`/projects/${prj.id}`}
                      className="w-full inline-flex items-center justify-between text-xs font-medium text-vault-dim hover:text-emerald-400 transition-colors"
                    >
                      <span>Open Workspace</span>
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
