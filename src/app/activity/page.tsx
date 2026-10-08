'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Layers,
  ArrowRight,
} from '@/components/ui/icons';
import { AppShell } from '@/components/layout/AppShell';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch((err) => console.error('Failed to load activity feed:', err))
      .finally(() => setLoading(false));
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'COVERAGE_INCREASE':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CONFLICT_DETECTED':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'RISK_ALERT':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'VERIFICATION':
        return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SOURCE_PROCESSED':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Organizational Memory Timeline
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Live audit stream of knowledge extractions, verifications, gap alerts, and conflict resolutions.
            </p>
          </div>
        </div>

        {/* Section 36: Clean Vertical Timeline */}
        {loading ? (
          <div className="py-24 text-center text-vault-dim font-mono text-xs">
            Loading timeline events...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-xs text-vault-dim border border-vault-border rounded-xl">
            No events recorded yet.
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-vault-surface border border-vault-border">
            <div className="relative border-l border-vault-border/80 ml-3 sm:ml-4 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-vault-dark border border-vault-border flex items-center justify-center">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-vault-text">
                        {act.title}
                      </h4>
                      <span className="text-[11px] font-mono text-vault-dim shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-vault-muted leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-vault-dim pt-0.5">
                      {act.employee && <span>Employee: {act.employee.name}</span>}
                      {act.project && <span>Project: {act.project.name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
