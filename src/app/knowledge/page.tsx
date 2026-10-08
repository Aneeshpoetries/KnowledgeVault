'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';
import {
  RiskBadge,
  ConfidenceBadge,
  KnowledgeTypeBadge,
  FreshnessBadge,
} from '@/components/ui/Badges';
import { useAuth } from '@/context/AuthContext';
import { offlineKnowledge } from '@/lib/offline-demo';
import { demoKnowledge, saveDemoKnowledge } from '@/lib/demo-store';

export default function KnowledgePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [freshnessFilter, setFreshnessFilter] = useState('ALL');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    if (user?.id?.startsWith('demo-')) {
      setItems(demoKnowledge().filter((item) =>
        (typeFilter === 'ALL' || item.type === typeFilter) &&
        (riskFilter === 'ALL' || item.risk === riskFilter) &&
        (freshnessFilter === 'ALL' || item.freshness === freshnessFilter) &&
        (!search.trim() || `${item.title} ${item.summary} ${item.content}`.toLowerCase().includes(search.trim().toLowerCase()))
      ));
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (riskFilter !== 'ALL') params.set('risk', riskFilter);
      if (freshnessFilter !== 'ALL') params.set('freshness', freshnessFilter);

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItems();
  }, [user?.id, typeFilter, riskFilter, freshnessFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleVerify = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setVerifyingId(itemId);
    if (user?.id?.startsWith('demo-')) {
      const next = demoKnowledge().map(item => item.id === itemId ? { ...item, freshness: 'FRESH', lastVerifiedAt: new Date().toISOString() } : item);
      saveDemoKnowledge(next);
      setItems(current => current.map(item => item.id === itemId ? { ...item, freshness: 'FRESH', lastVerifiedAt: new Date().toISOString() } : item));
      setVerifyingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/knowledge/${itemId}/verify`, { method: 'POST' });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId
              ? { ...it, freshness: 'FRESH', lastVerifiedAt: new Date().toISOString() }
              : it
          )
        );
      }
    } catch {
      alert('Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const types = [
    { label: 'All', value: 'ALL' },
    { label: 'Architecture', value: 'ARCHITECTURE' },
    { label: 'Troubleshooting', value: 'TROUBLESHOOTING' },
    { label: 'Runbook', value: 'PROCESS' },
    { label: 'Decision', value: 'OPERATIONAL_TIP' },
    { label: 'Business Rule', value: 'BUSINESS_RULE' },
    { label: 'Edge Case', value: 'EDGE_CASE' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Knowledge
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Everything your organization knows, connected to where it came from.
            </p>
          </div>

          <Link
            href="/capture"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Memory</span>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Large Minimal Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-vault-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operational knowledge, failure modes, procedures..."
                className="w-full bg-vault-surface border border-vault-border hover:border-vault-border/90 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-vault-text placeholder:text-vault-dim focus:outline-none transition-colors"
              />
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                filtersOpen || riskFilter !== 'ALL' || freshnessFilter !== 'ALL'
                  ? 'bg-vault-subtle text-vault-text border-vault-border'
                  : 'bg-vault-surface text-vault-muted border-vault-border hover:text-vault-text'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                Filters{' '}
                {(riskFilter !== 'ALL' ? 1 : 0) + (freshnessFilter !== 'ALL' ? 1 : 0) > 0 &&
                  `(${
                    (riskFilter !== 'ALL' ? 1 : 0) + (freshnessFilter !== 'ALL' ? 1 : 0)
                  })`}
              </span>
            </button>
          </div>

          {/* Compact Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === t.value
                    ? 'bg-vault-border text-vault-text border border-vault-border'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter Popover Row */}
          {filtersOpen && (
            <div className="p-3.5 rounded-lg bg-vault-surface border border-vault-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in duration-100">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1.5">
                  Risk Level
                </label>
                <div className="flex items-center gap-1.5">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        riskFilter === r
                          ? 'bg-vault-border text-vault-text border-vault-border'
                          : 'text-vault-muted border-vault-border/60 hover:text-vault-text'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1.5">
                  Freshness Status
                </label>
                <div className="flex items-center gap-1.5">
                  {['ALL', 'FRESH', 'AGING', 'STALE'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFreshnessFilter(f)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        freshnessFilter === f
                          ? 'bg-vault-border text-vault-text border-vault-border'
                          : 'text-vault-muted border-vault-border/60 hover:text-vault-text'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results List: Elegant Rows rather than Giant Cards (Section 13) */}
        <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-vault-dim font-mono">
              Searching organizational memory...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Brain className="w-8 h-8 text-vault-dim mx-auto opacity-40" />
              <p className="text-sm font-medium text-vault-text">Your organizational memory is empty</p>
              <p className="text-xs text-vault-dim max-w-sm mx-auto">
                No items match your filter criteria. Ingest meeting notes or conduct an exit interview.
              </p>
              <Link
                href="/capture"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vault-border text-xs font-medium text-vault-text hover:bg-vault-subtle transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture knowledge</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 sm:p-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-vault-border bg-vault-surface vault-hover-row gap-5 min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="space-y-3 mb-3">
                      <KnowledgeTypeBadge type={item.type} />
                      <h3 className="text-base font-semibold text-vault-text leading-snug hover:text-indigo-400 transition-colors">
                        <Link href={`/knowledge/${item.id}`}>{item.title}</Link>
                      </h3>
                    </div>

                    <p className="text-xs text-vault-muted leading-relaxed line-clamp-2 mb-4">
                      {item.summary || item.content}
                    </p>

                    <div className="flex flex-col gap-2 text-[11px] text-vault-dim break-words">
                      {item.project && (
                        <span>
                          Project: <strong className="text-vault-muted font-normal">{item.project.name}</strong>
                        </span>
                      )}
                      {item.source && (
                        <span>
                          Source: <span className="text-vault-muted">{item.source.name}</span>
                        </span>
                      )}
                      {item.employee && (
                        <span>
                          Owner: <span className="text-vault-muted">{item.employee.name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-vault-border/60">
                    <RiskBadge risk={item.risk} />
                    <ConfidenceBadge
                      confidence={item.confidence}
                      sourceTitle={item.source?.name}
                      verifiedBy={item.verifiedBy}
                      lastVerifiedAt={item.lastVerifiedAt}
                      freshness={item.freshness}
                    />
                    <FreshnessBadge
                      freshness={item.freshness}
                      lastVerifiedAt={item.lastVerifiedAt}
                    />

                    {/* Quick Verify action button */}
                    {item.freshness !== 'FRESH' && (
                      <button
                        type="button"
                        onClick={(e) => handleVerify(item.id, e)}
                        disabled={verifyingId === item.id}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                        title="Confirm accuracy as domain expert"
                      >
                        {verifyingId === item.id ? 'Verifying...' : 'Verify'}
                      </button>
                    )}

                    <Link href={`/knowledge/${item.id}`} className="ml-auto inline-flex items-center gap-1 text-xs text-vault-muted hover:text-vault-text" aria-label={`View evidence for ${item.title}`}>Evidence<ChevronRight className="w-4 h-4" /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
