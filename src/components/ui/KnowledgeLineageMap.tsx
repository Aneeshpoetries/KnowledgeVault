'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, User, FolderGit2, Cpu, Brain, Sparkles } from 'lucide-react';

interface LineageNode {
  type: 'employee' | 'project' | 'technology' | 'knowledge';
  title: string;
  subtitle: string;
  meta: string;
  accent: string;
}

const NODES: LineageNode[] = [
  {
    type: 'employee',
    title: 'Rahul Sharma',
    subtitle: 'Staff Infrastructure',
    meta: '73% concentration',
    accent: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
  },
  {
    type: 'project',
    title: 'Payment System',
    subtitle: 'Core Banking API',
    meta: '54% coverage',
    accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    type: 'technology',
    title: 'Payment Gateway',
    subtitle: 'Stripe & PgBouncer',
    meta: 'Tier-1 Service',
    accent: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    type: 'knowledge',
    title: '12 Knowledge Items',
    subtitle: 'Runbooks & Incident Ops',
    meta: '4 Critical Gaps',
    accent: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
  },
];

export function KnowledgeLineageMap() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim">
            Knowledge Lineage
          </span>
          <span className="text-[11px] text-vault-muted">· Core dependency path</span>
        </div>
        <Link
          href="/graph"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Explore full graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-vault-surface border border-vault-border">
        {/* Horizontal interactive flow */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {NODES.map((node, i) => {
            const isActive = activeIdx === i;
            return (
              <React.Fragment key={node.title}>
                <div
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full md:w-1/4 p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-vault-dark border-vault-border shadow-elevated scale-[1.02]'
                      : 'bg-vault-dark/50 border-vault-border/60 hover:border-vault-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`p-1 rounded text-xs border ${node.accent}`}>
                      {node.type === 'employee' && <User className="w-3 h-3" />}
                      {node.type === 'project' && <FolderGit2 className="w-3 h-3" />}
                      {node.type === 'technology' && <Cpu className="w-3 h-3" />}
                      {node.type === 'knowledge' && <Brain className="w-3 h-3" />}
                    </span>
                    <span className="text-[10px] font-mono text-vault-dim">{node.meta}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-vault-text truncate">{node.title}</h4>
                  <p className="text-[11px] text-vault-muted truncate mt-0.5">{node.subtitle}</p>
                </div>

                {i < NODES.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-vault-dim shrink-0">
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dynamic Context Detail */}
        <div className="mt-3 pt-3 border-t border-vault-border/60 flex items-center justify-between text-xs text-vault-muted">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {activeIdx === 0 && 'Rahul is the sole contributor for critical failover protocols in Payment System.'}
              {activeIdx === 1 && 'Payment System handles settlement reconciliation with midnight batch dependencies.'}
              {activeIdx === 2 && 'Stripe webhook timeout configurations require specific PgBouncer pooling guards.'}
              {activeIdx === 3 && '4 of 12 items have single-person ownership; remaining 8 require exit recovery.'}
            </span>
          </div>
          <Link
            href="/graph"
            className="text-[11px] font-mono text-indigo-400 hover:underline shrink-0 ml-2"
          >
            Inspect in 3D / 2D Graph →
          </Link>
        </div>
      </div>
    </div>
  );
}
