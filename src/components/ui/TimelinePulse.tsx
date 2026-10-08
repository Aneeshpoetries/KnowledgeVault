'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, FileText, ArrowRight } from '@/components/ui/icons';

interface PulseEvent {
  id: string;
  type: 'capture' | 'verify' | 'gap' | 'source' | 'conflict';
  title: string;
  detail: string;
  time: string;
}

interface DayPulse {
  day: string;
  date: string;
  active: boolean;
  events: PulseEvent[];
}

const DEFAULT_DAYS: DayPulse[] = [
  {
    day: 'Mon',
    date: 'Sep 22',
    active: true,
    events: [
      { id: '1', type: 'source', title: '3 sources processed', detail: 'Processed incident transcripts and the post-mortem archive', time: '09:14' },
      { id: '2', type: 'capture', title: '+8 knowledge items', detail: 'Extracted automated failover & Redis queue guidelines', time: '11:30' },
    ],
  },
  {
    day: 'Tue',
    date: 'Sep 23',
    active: true,
    events: [
      { id: '3', type: 'verify', title: '+2 verified', detail: 'Rahul Sharma confirmed Stripe Webhook Rotation procedure', time: '14:20' },
    ],
  },
  {
    day: 'Wed',
    date: 'Sep 24',
    active: true,
    events: [
      { id: '4', type: 'gap', title: '1 new critical gap', detail: 'Single point of failure detected on Payment Settlement Cron', time: '16:45' },
    ],
  },
  {
    day: 'Thu',
    date: 'Sep 25',
    active: true,
    events: [
      { id: '5', type: 'capture', title: '+14 knowledge items', detail: 'Ingested Customer Portal v2 Architecture specs', time: '10:05' },
      { id: '6', type: 'conflict', title: '1 conflict resolved', detail: 'Reconciled auth token expiration between Portal & Billing API', time: '15:10' },
    ],
  },
  {
    day: 'Fri',
    date: 'Sep 26',
    active: true,
    events: [
      { id: '7', type: 'verify', title: '+4 verified', detail: 'Elena Rostova approved Analytics ETL runbooks', time: '13:00' },
    ],
  },
  {
    day: 'Sat',
    date: 'Sep 27',
    active: false,
    events: [],
  },
  {
    day: 'Sun',
    date: 'Sep 28',
    active: true,
    events: [
      { id: '8', type: 'capture', title: '+3 knowledge items', detail: 'Captured live exit interview responses from Rahul Sharma', time: '20:15' },
    ],
  },
];

export function TimelinePulse() {
  const [selectedDay, setSelectedDay] = useState<DayPulse | null>(DEFAULT_DAYS[4]); // Thursday selected by default

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim">
            Memory activity
          </span>
          <span className="text-[11px] text-vault-muted">· Example activity</span>
        </div>
        <span className="text-[11px] text-vault-dim font-mono">Sample week</span>
      </div>

      {/* Horizontal timeline bar */}
      <div className="relative p-4 rounded-xl bg-vault-surface border border-vault-border">
        {/* Continuous horizontal connector line */}
        <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-vault-border -translate-y-1/2 z-0" />

        <div className="relative z-10 grid grid-cols-7 gap-2">
          {DEFAULT_DAYS.map((d, idx) => {
            const isSelected = selectedDay?.day === d.day;
            const hasEvents = d.events.length > 0;

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(d)}
                aria-pressed={isSelected} aria-label={`${d.day}, ${d.events.length} events`}
                className={`flex flex-col items-center p-2 rounded-lg transition-all group ${
                  isSelected
                    ? 'bg-vault-subtle border border-vault-border/80 shadow-subtle'
                    : 'hover:bg-vault-subtle/50'
                }`}
              >
                <span className="text-[11px] font-medium text-vault-dim group-hover:text-vault-text transition-colors">
                  {d.day}
                </span>

                {/* Event node dot on the line */}
                <div className="my-2.5 relative flex items-center justify-center">
                  <div
                    className={`w-3 h-3 rounded-full border transition-all ${
                      hasEvents
                        ? isSelected
                          ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] scale-110'
                          : 'bg-vault-surface border-vault-border-hover group-hover:scale-110'
                        : 'bg-vault-surface border-vault-border'
                    }`}
                  />
                  {hasEvents && !isSelected && (
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] opacity-40 pointer-events-none" />
                  )}
                </div>

                <span className="text-[10px] font-mono text-vault-dim truncate">
                  {hasEvents ? `${d.events.length} event${d.events.length > 1 ? 's' : ''}` : 'idle'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Event Drawer */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={selectedDay.day}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-4 pt-3 border-t border-vault-border/60"
            >
              <div className="flex items-center justify-between text-xs text-vault-dim mb-2.5">
                <span className="font-medium text-vault-text">
                  Events on {selectedDay.day}, {selectedDay.date}
                </span>
                <span className="text-[11px] font-mono text-vault-dim">
                  {selectedDay.events.length} recorded
                </span>
              </div>

              {selectedDay.events.length === 0 ? (
                <p className="text-xs text-vault-dim py-1">No continuity changes recorded on this day.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDay.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-vault-dark border border-vault-border/60 flex items-start gap-2.5 text-xs"
                    >
                      <div className="mt-0.5 shrink-0">
                        {ev.type === 'capture' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                        {ev.type === 'verify' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {ev.type === 'gap' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {ev.type === 'source' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                        {ev.type === 'conflict' && <ArrowRight className="w-3.5 h-3.5 text-violet-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-vault-text truncate">{ev.title}</span>
                          <span className="text-[10px] font-mono text-vault-dim shrink-0">{ev.time}</span>
                        </div>
                        <p className="text-[11px] text-vault-muted truncate mt-0.5">{ev.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
