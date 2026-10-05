'use client';

import React, { useState } from 'react';
import { RiskLevel, KnowledgeType, FreshnessStatus } from '@/lib/types';
import { AlertTriangle, Clock, HelpCircle } from 'lucide-react';
import { TrustModal } from './TrustModal';

export function RiskBadge({ risk }: { risk: RiskLevel | string }) {
  switch (risk) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F391AC]/25 text-[#8b0a30] border border-[#F391AC]/40 dark:text-[#F391AC] dark:bg-[#F391AC]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F391AC]" />Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8BFA5]/30 text-[#7a3010] border border-[#F8BFA5]/50 dark:text-[#F8BFA5] dark:bg-[#F8BFA5]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F8BFA5]" />High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8D4A7]/30 text-[#7a5510] border border-[#F8D4A7]/50 dark:text-[#F8D4A7] dark:bg-[#F8D4A7]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F8D4A7]" />Medium
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A0C4F6]/25 text-[#1a3f6b] border border-[#A0C4F6]/40 dark:text-[#A0C4F6] dark:bg-[#A0C4F6]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A0C4F6]" />Low
        </span>
      );
  }
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
            ? 'text-[#1a3f6b] bg-[#A0C4F6]/25 border-[#A0C4F6]/40 dark:text-[#A0C4F6] dark:bg-[#A0C4F6]/15'
            : 'text-[#7a5510] bg-[#F8D4A7]/30 border-[#F8D4A7]/50 dark:text-[#F8D4A7] dark:bg-[#F8D4A7]/15'
        } ${interactive ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#A0C4F6] animate-pulse" />
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
  const colors: Record<string, string> = {
    'RUNBOOK':          'bg-[#C8A2F9]/20 text-[#4a1a8b] border-[#C8A2F9]/40 dark:text-[#C8A2F9] dark:bg-[#C8A2F9]/10',
    'ARCHITECTURE':     'bg-[#A0C4F6]/20 text-[#1a3f6b] border-[#A0C4F6]/40 dark:text-[#A0C4F6] dark:bg-[#A0C4F6]/10',
    'TROUBLESHOOTING':  'bg-[#F8BFA5]/20 text-[#7a3010] border-[#F8BFA5]/40 dark:text-[#F8BFA5] dark:bg-[#F8BFA5]/10',
    'DECISION':         'bg-[#F8D4A7]/20 text-[#7a5510] border-[#F8D4A7]/40 dark:text-[#F8D4A7] dark:bg-[#F8D4A7]/10',
    'PROCESS':          'bg-[#F391AC]/20 text-[#8b0a30] border-[#F391AC]/40 dark:text-[#F391AC] dark:bg-[#F391AC]/10',
  };
  const colorClass = colors[type] || 'bg-vault-subtle text-vault-muted border-vault-border';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${colorClass}`}>
      {clean}
    </span>
  );
}

export { KnowledgeTypeBadge as TypeBadge };

export function FreshnessBadge({ freshness, lastVerifiedAt }: { freshness?: FreshnessStatus | string; lastVerifiedAt?: string | Date | null }) {
  switch (freshness) {
    case 'FRESH':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />Fresh
        </span>
      );
    case 'AGING':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7a5510]">
          <Clock className="w-3 h-3 text-[#F8D4A7]" />Aging
        </span>
      );
    case 'STALE':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8b0a30]">
          <AlertTriangle className="w-3 h-3 text-[#F391AC]" />Stale
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-vault-dim font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-vault-border" />Unverified
        </span>
      );
  }
}
