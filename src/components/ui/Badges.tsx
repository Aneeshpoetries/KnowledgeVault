'use client';

import React, { useState } from 'react';
import { RiskLevel, KnowledgeType, FreshnessStatus } from '@/lib/types';
import { AlertTriangle, Clock, HelpCircle } from '@/components/ui/icons';
import { TrustModal } from './TrustModal';

export function RiskBadge({ risk }: { risk: RiskLevel | string }) {
  const label = risk === 'CRITICAL' ? 'Critical' : risk === 'HIGH' ? 'High' : risk === 'MEDIUM' ? 'Medium' : 'Low';
  return <span className={`vault-risk-badge risk-${label.toLowerCase()}`}><span aria-hidden="true" />{label}</span>;
}

export function ConfidenceBadge({
  confidence, interactive = true, sourceTitle, verifiedBy, lastVerifiedAt, freshness,
}: {
  confidence: number; interactive?: boolean; sourceTitle?: string;
  verifiedBy?: string | null; lastVerifiedAt?: string | Date | null; freshness?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const percent = Math.round(confidence * 100);

  return (
    <>
      <button
        type="button"
        disabled={!interactive}
        onClick={(e) => { if (interactive) { e.stopPropagation(); setModalOpen(true); } }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
          percent >= 85
            ? 'text-[#93C8FF] bg-[#A0C4F6]/25 border-[#A0C4F6]/40 dark:text-[#93C8FF] dark:bg-[#A0C4F6]/15'
            : 'text-[#F7D480] bg-[#F8D4A7]/30 border-[#F8D4A7]/50 dark:text-[#F7D480] dark:bg-[#F8D4A7]/15'
        } ${interactive ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#262958] animate-pulse" />
        {percent}% confidence
        {interactive && <HelpCircle className="w-2.5 h-2.5 opacity-60" />}
      </button>
      {interactive && (
        <TrustModal
          isOpen={modalOpen} onClose={() => setModalOpen(false)}
          confidence={confidence} sourceTitle={sourceTitle}
          verifiedBy={verifiedBy} lastVerifiedAt={lastVerifiedAt} freshness={freshness}
        />
      )}
    </>
  );
}

export function KnowledgeTypeBadge({ type }: { type: KnowledgeType | string }) {
  const clean = type ? type.replace(/_/g, ' ') : 'KNOWLEDGE';
  return <span className="vault-type-badge">{clean}</span>;
}

export { KnowledgeTypeBadge as TypeBadge };

export function FreshnessBadge({ freshness, lastVerifiedAt }: { freshness?: FreshnessStatus | string; lastVerifiedAt?: string | Date | null }) {
  const label = freshness === 'FRESH' ? 'Fresh' : freshness === 'AGING' ? 'Aging' : freshness === 'STALE' ? 'Stale' : 'Unverified';
  const color = freshness === 'FRESH' ? 'var(--accent-emerald)' : freshness === 'AGING' ? 'var(--accent-amber)' : freshness === 'STALE' ? 'var(--accent-rose)' : 'var(--vault-dim)';
  return <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color }} title={lastVerifiedAt ? `Last verified ${new Date(lastVerifiedAt).toLocaleDateString()}` : undefined}>
    {freshness === 'STALE' ? <AlertTriangle size={14} /> : freshness === 'AGING' ? <Clock size={14} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}{label}
  </span>;
}
