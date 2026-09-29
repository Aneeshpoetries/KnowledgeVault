'use client';

import React, { useState } from 'react';
import { RiskLevel, KnowledgeType, FreshnessStatus } from '@/lib/types';
import { ShieldAlert, AlertTriangle, ShieldCheck, Clock, Check, HelpCircle } from 'lucide-react';
import { TrustModal } from './TrustModal';

export function RiskBadge({ risk }: { risk: RiskLevel | string }) {
  switch (risk) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Critical Risk
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Medium
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Low
        </span>
      );
  }
}

export function ConfidenceBadge({
  confidence,
  interactive = true,
  sourceTitle,
  verifiedBy,
  lastVerifiedAt,
  freshness,
}: {
  confidence: number;
  interactive?: boolean;
  sourceTitle?: string;
  verifiedBy?: string | null;
  lastVerifiedAt?: string | Date | null;
  freshness?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const percent = Math.round(confidence * 100);

  return (
    <>
      <button
        type="button"
        disabled={!interactive}
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation();
            setModalOpen(true);
          }
        }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
          percent >= 85
            ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40 hover:border-cyan-700/60'
            : 'text-amber-400 bg-amber-950/40 border-amber-800/40 hover:border-amber-700/60'
        } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        title="Click to view confidence criteria"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>{percent}% confidence</span>
        {interactive && <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
      </button>

      {interactive && (
        <TrustModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          confidence={confidence}
          sourceTitle={sourceTitle}
          verifiedBy={verifiedBy}
          lastVerifiedAt={lastVerifiedAt}
          freshness={freshness}
        />
      )}
    </>
  );
}

export function KnowledgeTypeBadge({ type }: { type: KnowledgeType | string }) {
  const clean = type ? type.replace(/_/g, ' ') : 'KNOWLEDGE';
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide uppercase bg-vault-border/60 text-vault-muted border border-vault-border">
      {clean}
    </span>
  );
}

export { KnowledgeTypeBadge as TypeBadge };

export function FreshnessBadge({
  freshness,
  lastVerifiedAt,
}: {
  freshness?: FreshnessStatus | string;
  lastVerifiedAt?: string | Date | null;
}) {
  switch (freshness) {
    case 'FRESH':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Fresh
        </span>
      );
    case 'AGING':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
          <Clock className="w-3 h-3" />
          Aging
        </span>
      );
    case 'STALE':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
          <AlertTriangle className="w-3 h-3" />
          Stale
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-vault-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-vault-border" />
          Unverified
        </span>
      );
  }
}
