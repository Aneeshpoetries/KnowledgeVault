import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck } from '@/components/ui/icons';
import Link from 'next/link';

interface InsightCardProps {
  title: string;
  description: string;
  type?: 'WARNING' | 'OPPORTUNITY' | 'STRENGTH';
  actionLabel?: string;
  actionHref?: string;
}

export function InsightCard({
  title,
  description,
  type = 'WARNING',
  actionLabel,
  actionHref,
}: InsightCardProps) {
  const getStyles = () => {
    switch (type) {
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          border: 'border-amber-500/25 bg-amber-950/20',
          badge: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
          badgeText: 'RISK SIGNAL',
        };
      case 'STRENGTH':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/25 bg-emerald-950/20',
          badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
          badgeText: 'RESILIENT',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />,
          border: 'border-cyan-500/25 bg-cyan-950/20',
          badge: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
          badgeText: 'AI SYNTHESIS',
        };
    }
  };

  const s = getStyles();

  return (
    <div className={`p-4 rounded-xl border ${s.border} backdrop-blur-sm space-y-2 relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {s.icon}
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${s.badge}`}>
            {s.badgeText}
          </span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <div className="pt-1">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
