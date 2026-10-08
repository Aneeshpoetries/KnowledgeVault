'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  FileText,
  Users,
  MessageSquare,
  Terminal,
  ArrowRight,
  Plus,
  ChevronRight,
  CheckCircle2,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import { ConfidenceBadge } from '@/components/ui/Badges';
import { useAuth } from '@/context/AuthContext';
import { offlineSources } from '@/lib/offline-demo';

export default function SourcesPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.id.startsWith('demo-')) {
      setSources(offlineSources);
      setLoading(false);
      return;
    }
    fetch('/api/sources')
      .then((res) => res.json())
      .then((data) => setSources(data.sources || []))
      .catch((err) => console.error('Failed to load sources:', err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Source Provenance Library
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Verified artifacts, meeting transcripts, and incident reviews feeding organizational memory.
            </p>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Source</span>
          </Link>
        </div>

        {/* Section 35: Clean Table Layout */}
        <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
          {loading ? (
            <div className="py-24 text-center text-vault-dim font-mono text-xs">
              Indexing source provenance records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vault-border/60 bg-vault-dark text-[11px] font-mono uppercase tracking-wider text-vault-dim">
                    <th className="py-2.5 px-4 font-normal">Source</th>
                    <th className="py-2.5 px-4 font-normal">Type</th>
                    <th className="py-2.5 px-4 font-normal">Extracted Knowledge</th>
                    <th className="py-2.5 px-4 font-normal">Status</th>
                    <th className="py-2.5 px-4 font-normal">Last Updated</th>
                    <th className="py-2.5 px-4 font-normal text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border/40">
                  {sources.map((src) => (
                    <tr key={src.id} className="vault-hover-row">
                      <td className="py-3 px-4">
                        <Link
                          href={`/sources/${src.id}`}
                          className="font-medium text-vault-text hover:text-indigo-400 transition-colors"
                        >
                          {src.name || src.title}
                        </Link>
                        <p className="text-[11px] text-vault-dim font-mono">
                          {src.fileName || 'Direct stream'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vault-dark text-vault-dim border border-vault-border">
                          {src.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-vault-text">
                          {src.knowledgeItems?.length || 2} items
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PROCESSED</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-vault-dim font-mono text-[11px]">
                        {new Date(src.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/sources/${src.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
