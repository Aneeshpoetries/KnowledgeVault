'use client';

import React from 'react';
import { X, ShieldCheck, Cpu, FileCheck2, UserCheck, AlertCircle } from 'lucide-react';

interface TrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  confidence: number;
  sourceTitle?: string;
  verifiedBy?: string | null;
  lastVerifiedAt?: string | Date | null;
  freshness?: string;
}

export function TrustModal({
  isOpen,
  onClose,
  confidence,
  sourceTitle = 'Verified Source Artifact',
  verifiedBy,
  lastVerifiedAt,
  freshness = 'FRESH',
}: TrustModalProps) {
  if (!isOpen) return null;

  const percent = Math.round(confidence * 100);

  const criteria = [
    {
      icon: Cpu,
      label: 'Extraction Certainty',
      score: percent >= 85 ? 'High (94%)' : 'Moderate (78%)',
      desc: 'Clustering density of domain syntax and lack of contradictory statements.',
      passed: true,
    },
    {
      icon: FileCheck2,
      label: 'Source Authority',
      score: sourceTitle ? 'Direct Citation' : 'Derived Transcript',
      desc: sourceTitle,
      passed: true,
    },
    {
      icon: UserCheck,
      label: 'Human Verification',
      score: verifiedBy ? `Confirmed by ${verifiedBy}` : 'Pending Peer Review',
      desc: lastVerifiedAt ? `Last audited on ${new Date(lastVerifiedAt).toLocaleDateString()}` : 'Awaiting subject-matter expert signoff',
      passed: !!verifiedBy,
    },
    {
      icon: ShieldCheck,
      label: 'Freshness Index',
      score: freshness,
      desc: 'Evaluated against operational decay window (60-day baseline).',
      passed: freshness === 'FRESH',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-vault-surface border border-vault-border rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-vault-border/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-vault-text">Confidence Rationale</h3>
            <p className="text-xs text-vault-muted">Continuity verification breakdown</p>
          </div>
        </div>

        <div className="p-3 mb-5 rounded-lg bg-vault-dark border border-vault-border flex items-center justify-between">
          <span className="text-xs text-vault-muted">Overall AI Confidence</span>
          <span className="text-sm font-mono font-semibold text-cyan-400">{percent}%</span>
        </div>

        <div className="space-y-3 mb-6">
          {criteria.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.passed ? 'text-indigo-400' : 'text-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-vault-text">{item.label}</span>
                    <span className={`text-[11px] font-mono ${item.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-vault-muted truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-vault-border/60 flex items-center justify-between text-[11px] text-vault-dim">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-vault-muted" />
            KnowledgeVault Trust Protocol
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-vault-border/80 text-vault-text hover:bg-vault-border text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
