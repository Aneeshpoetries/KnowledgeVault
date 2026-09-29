'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CoverageBarProps {
  label: string;
  score: number;
  expected?: number;
  captured?: number;
  status?: 'STRONG' | 'MODERATE' | 'WEAK' | 'CRITICAL_GAP';
  explanation?: string;
  showDetails?: boolean;
}

export function CoverageBar({
  label,
  score,
  expected,
  captured,
  status,
  explanation,
  showDetails = true,
}: CoverageBarProps) {
  const getBarColor = (val: number) => {
    if (val >= 75) return 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
    if (val >= 50) return 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
    if (val >= 35) return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  };

  const getStatusBadge = () => {
    if (score >= 75) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
          Strong
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-950/80 text-blue-400 border border-blue-800/40">
          Moderate
        </span>
      );
    }
    if (score >= 35) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-950/80 text-amber-400 border border-amber-800/40">
          Weak
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-red-950/80 text-red-400 border border-red-800/40 animate-pulse">
        Critical Gap
      </span>
    );
  };

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200">{label}</span>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-3">
          {expected !== undefined && captured !== undefined && (
            <span className="text-slate-400 text-[11px] font-mono">
              {captured}/{expected} items
            </span>
          )}
          <span className="font-mono font-bold text-white text-xs">{Math.round(score)}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
        <motion.div
          className={`h-full rounded-full ${getBarColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showDetails && explanation && (
        <p className="text-[11px] text-slate-400 line-clamp-1">{explanation}</p>
      )}
    </div>
  );
}
