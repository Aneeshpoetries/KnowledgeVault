'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Brain,
  FileText,
  Clock,
  Network,
  Users,
  FolderGit2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  RiskBadge,
  ConfidenceBadge,
  KnowledgeTypeBadge,
  FreshnessBadge,
} from '@/components/ui/Badges';

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<any>(null);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/knowledge/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.item) {
          setItem(data.item);
          setRelationships(data.relationships || []);
        }
      })
      .catch((err) => console.error('Failed to load item:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/knowledge/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setItem((prev: any) => ({
          ...prev,
          freshness: 'FRESH',
          lastVerifiedAt: data.item.lastVerifiedAt,
          verifiedBy: data.item.verifiedBy,
        }));
      }
    } catch {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Loading organizational memory record...
        </div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <div className="p-12 text-center text-vault-dim">
          <p className="text-sm font-medium text-vault-text">Knowledge record not found</p>
          <Link href="/knowledge" className="mt-2 text-xs text-indigo-400 hover:underline inline-block">
            ← Return to knowledge repository
          </Link>
        </div>
      </AppShell>
    );
  }

  const problems = item.problemsJson ? JSON.parse(item.problemsJson) : [];
  const solutions = item.solutionsJson ? JSON.parse(item.solutionsJson) : [];
  const dependencies = item.dependenciesJson ? JSON.parse(item.dependenciesJson) : [];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to repository</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={`/graph?focus=${encodeURIComponent(item.title)}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-vault-surface border border-vault-border hover:border-vault-border/90 text-vault-muted hover:text-vault-text transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span>Locate in Graph</span>
            </Link>
          </div>
        </div>

        {/* Clean Editorial Layout (Section 14) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Metadata & Trust Profile (cols 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                  Type
                </span>
                <KnowledgeTypeBadge type={item.type} />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                  Continuity Risk
                </span>
                <RiskBadge risk={item.risk} />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                  AI Confidence
                </span>
                <ConfidenceBadge
                  confidence={item.confidence}
                  sourceTitle={item.source?.name}
                  verifiedBy={item.verifiedBy}
                  lastVerifiedAt={item.lastVerifiedAt}
                  freshness={item.freshness}
                />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                  Freshness
                </span>
                <FreshnessBadge
                  freshness={item.freshness}
                  lastVerifiedAt={item.lastVerifiedAt}
                />
              </div>

              <div className="pt-3 border-t border-vault-border/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                  Verification
                </span>
                {item.verifiedBy ? (
                  <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed by {item.verifiedBy}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full py-1.5 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    {verifying ? 'Verifying...' : 'Verify this knowledge'}
                  </button>
                )}
                {item.lastVerifiedAt && (
                  <p className="text-[10px] text-vault-dim font-mono mt-1">
                    {new Date(item.lastVerifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: The Knowledge & Why It Matters (cols 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
                {item.title}
              </h1>
              {item.summary && (
                <p className="text-sm text-vault-muted mt-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>

            {/* The Knowledge Content */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
                The Knowledge
              </span>
              <div className="p-4 rounded-xl bg-vault-surface border border-vault-border text-xs sm:text-sm text-vault-text leading-relaxed whitespace-pre-line font-sans">
                {item.content}
              </div>
            </div>

            {/* Structured Problems & Solutions */}
            {(problems.length > 0 || solutions.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {problems.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block mb-2">
                      Failure Modes Handled
                    </span>
                    <ul className="space-y-1.5 text-xs text-vault-muted">
                      {problems.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {solutions.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-2">
                      Resolution Actions
                    </span>
                    <ul className="space-y-1.5 text-xs text-vault-muted">
                      {solutions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Why It Matters */}
            {item.whyItMatters && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-vault-dim">
                  Why It Matters
                </span>
                <div className="p-3.5 rounded-lg bg-vault-subtle/50 border border-vault-border/60 text-xs text-vault-muted leading-relaxed">
                  {item.whyItMatters}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Evidence & Source Chain (cols 3) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Visual Source Chain */}
            <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                Evidence Chain
              </span>

              <div className="space-y-2 relative">
                {/* Step 1: Knowledge */}
                <div className="p-2.5 rounded-lg bg-vault-dark border border-vault-border text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-medium mb-0.5">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Extracted Rule</span>
                  </div>
                  <p className="text-[11px] text-vault-dim truncate">{item.title}</p>
                </div>

                <div className="text-center text-vault-dim text-[10px] font-mono">↓ derived from</div>

                {/* Step 2: Source */}
                <div className="p-2.5 rounded-lg bg-vault-dark border border-vault-border text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-medium mb-0.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{item.source?.name || 'Raw Operational Transcript'}</span>
                  </div>
                  <p className="text-[10px] text-vault-dim">
                    {item.source?.type || 'INCIDENT_POSTMORTEM'}
                  </p>
                </div>

                {item.originalSourceText && (
                  <>
                    <div className="text-center text-vault-dim text-[10px] font-mono">↓ excerpt</div>

                    {/* Step 3: Original context */}
                    <div className="p-2.5 rounded-lg bg-vault-dark border border-vault-border text-[11px] text-vault-dim italic font-mono max-h-32 overflow-y-auto">
                      &ldquo;{item.originalSourceText.slice(0, 180)}...&rdquo;
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related Context: People & Projects */}
            <div className="p-4 rounded-xl bg-vault-surface border border-vault-border space-y-3 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                Contextual Entities
              </span>

              {item.employee && (
                <div className="flex items-center justify-between">
                  <span className="text-vault-dim">Subject Expert:</span>
                  <Link
                    href={`/employees/${item.employee.id}`}
                    className="font-medium text-vault-text hover:text-indigo-400 transition-colors"
                  >
                    {item.employee.name}
                  </Link>
                </div>
              )}

              {item.project && (
                <div className="flex items-center justify-between">
                  <span className="text-vault-dim">System / Project:</span>
                  <Link
                    href={`/projects/${item.project.id}`}
                    className="font-medium text-vault-text hover:text-emerald-400 transition-colors"
                  >
                    {item.project.name}
                  </Link>
                </div>
              )}

              {dependencies.length > 0 && (
                <div className="pt-2 border-t border-vault-border/60">
                  <span className="text-[10px] text-vault-dim block mb-1 font-mono">Dependencies</span>
                  <div className="flex flex-wrap gap-1">
                    {dependencies.map((d: string, i: number) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-vault-dark text-vault-dim border border-vault-border"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
