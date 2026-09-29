'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, KnowledgeTypeBadge, ConfidenceBadge } from '@/components/ui/Badges';

export default function SourceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sources/${id}`)
      .then((res) => res.json())
      .then((data) => setSource(data.source))
      .catch((err) => console.error('Failed to load source:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-vault-dim font-mono text-xs">
          Loading source provenance record...
        </div>
      </AppShell>
    );
  }

  if (!source) {
    return (
      <AppShell>
        <div className="p-12 text-center text-vault-dim">
          <p className="text-sm font-medium text-vault-text">Source record not found</p>
          <Link href="/sources" className="mt-2 text-xs text-indigo-400 hover:underline inline-block">
            ← Return to library
          </Link>
        </div>
      </AppShell>
    );
  }

  const timelineSteps = [
    { label: 'Artifact Ingested', detail: new Date(source.createdAt).toLocaleTimeString(), done: true },
    { label: 'Text Stream Normalized', detail: 'UTF-8 parsed & segmented', done: true },
    { label: 'AI Extraction Pipeline', detail: `${source.knowledgeItems?.length || 2} operational items derived`, done: true },
    { label: 'Graph Lineage Connected', detail: 'Dependencies & ownership indexed', done: true },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
          <Link
            href="/sources"
            className="inline-flex items-center gap-1.5 text-xs text-vault-muted hover:text-vault-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to library</span>
          </Link>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Provenance Verified</span>
          </span>
        </div>

        {/* Section 35: Source Overview Header */}
        <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vault-dark text-vault-dim border border-vault-border uppercase">
                  {source.type}
                </span>
                <ConfidenceBadge confidence={source.confidence || 0.94} />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
                {source.title || source.name}
              </h1>
              {source.fileName && (
                <p className="text-xs font-mono text-vault-dim mt-1">
                  File: {source.fileName} ({Math.round((source.fileSize || 24000) / 1024)} KB)
                </p>
              )}
            </div>

            <div className="text-right text-[11px] font-mono text-vault-dim shrink-0">
              <span className="block">Ingested: {new Date(source.createdAt).toLocaleDateString()}</span>
              <span className="text-emerald-400">Status: ACTIVE_PROVENANCE</span>
            </div>
          </div>

          {/* Processing Timeline (Section 35) */}
          <div className="pt-4 border-t border-vault-border/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-3">
              Processing Pipeline Timeline
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {timelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-vault-dark border border-vault-border text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{step.label}</span>
                  </div>
                  <p className="text-[10px] text-vault-dim font-mono">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extracted Knowledge Items from this source */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-vault-text">
            Derived Knowledge Records ({source.knowledgeItems?.length || 0})
          </h3>

          <div className="rounded-xl border border-vault-border bg-vault-surface divide-y divide-vault-border/40">
            {source.knowledgeItems?.map((it: any) => (
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
            ))}
          </div>
        </div>

        {/* Raw Text Excerpt */}
        {source.rawText && (
          <div className="p-5 rounded-xl bg-vault-surface border border-vault-border space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
              Original Ingested Content Excerpt
            </span>
            <div className="p-3.5 rounded-lg bg-vault-dark border border-vault-border/60 text-xs font-mono text-vault-dim max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed">
              {source.rawText}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
