'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FolderGit2,
  Users,
  Cpu,
  Brain,
  ShieldAlert,
  ArrowRight,
  Network,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, KnowledgeTypeBadge, ConfidenceBadge } from '@/components/ui/Badges';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { useAuth } from '@/context/AuthContext';
import { offlineProjects, offlineEmployees } from '@/lib/offline-demo';
import { demoKnowledge } from '@/lib/demo-store';

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    if (user?.id?.startsWith('demo-')) {
      const project = offlineProjects.find(item => item.id === id);
      setData({ project: project && { ...project, knowledgeItems: demoKnowledge().filter(item => item.project?.id === id), employeeAssignments: offlineEmployees.filter(item => item.projectAssignments.some(assignment => assignment.project.name === project.name)).map(employee => ({ employee })) } });
      setLoading(false);
      return;
    }
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load project:', err))
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Loading system workspace...
        </div>
      </AppShell>
    );
  }

  if (!data?.project) {
    return (
      <AppShell>
        <div className="p-12 text-center text-vault-dim">
          <p className="text-sm font-medium text-vault-text">Project not found</p>
          <Link href="/projects" className="mt-2 text-xs text-indigo-400 hover:underline inline-block">
            ← Return to projects directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const p = data.project;
  const coverage = Math.round(p.coverageScore || 54);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to projects</span>
          </Link>

          <Link
            href={`/graph?focus=${encodeURIComponent(p.name)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-vault-surface border border-vault-border text-vault-dim hover:text-vault-text transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Topology</span>
          </Link>
        </div>

        {/* Section 32: System Workspace Header */}
        <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
                  {p.name}
                </h1>
                <RiskBadge risk={p.riskLevel} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                {p.department || 'Infrastructure'}
              </span>
              <p className="text-xs text-vault-muted max-w-xl leading-relaxed">
                {p.description}
              </p>
            </div>

            {/* Quick KPIs: Health, Coverage, Critical Risks */}
            <div className="shrink-0 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-vault-dark border border-vault-border text-center">
                <span className="text-[10px] font-mono text-vault-dim block">Operational Health</span>
                <span className="text-sm font-semibold font-mono text-emerald-400">Good</span>
              </div>
              <div className="p-3 rounded-lg bg-vault-dark border border-vault-border text-center">
                <span className="text-[10px] font-mono text-vault-dim block">Knowledge Coverage</span>
                <span className="text-sm font-semibold font-mono text-cyan-400">{coverage}%</span>
              </div>
              <div className="p-3 rounded-lg bg-vault-dark border border-vault-border text-center">
                <span className="text-[10px] font-mono text-vault-dim block">Critical Risks</span>
                <span className="text-sm font-semibold font-mono text-red-400">2 Gaps</span>
              </div>
            </div>
          </div>

          {/* Key Technologies Stack */}
          {p.technologies && p.technologies.length > 0 && (
            <div className="pt-3 border-t border-vault-border/60 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-vault-dim">Stack:</span>
              {p.technologies.map((t: any) => (
                <span
                  key={t.technology.id}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-vault-dark border border-vault-border text-vault-muted"
                >
                  {t.technology.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Compact Workspace Sections: People & Knowledge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* People / Owners (cols 4) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim block">
              Contributors &amp; Owners
            </span>

            <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-3">
              {p.employeeAssignments?.map((ea: any) => (
                <div key={ea.employee.id} className="flex items-center justify-between text-xs">
                  <div>
                    <Link
                      href={`/employees/${ea.employee.id}`}
                      className="font-medium text-vault-text hover:text-indigo-400 transition-colors"
                    >
                      {ea.employee.name}
                    </Link>
                    <p className="text-[10px] text-vault-dim">{ea.role || ea.employee.role}</p>
                  </div>
                  <RiskBadge risk={ea.employee.riskLevel} />
                </div>
              ))}
            </div>
          </div>

          {/* Operational Knowledge Items (cols 8) */}
          <div className="lg:col-span-8 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim block">
              System Runbooks &amp; Procedures ({p.knowledgeItems?.length || 0})
            </span>

            <div className="rounded-xl border border-vault-border bg-vault-surface divide-y divide-vault-border/40">
              {p.knowledgeItems?.length === 0 ? (
                <div className="p-6 text-center text-xs text-vault-dim">
                  No knowledge items logged for this service yet.
                </div>
              ) : (
                p.knowledgeItems?.map((it: any) => (
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
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
