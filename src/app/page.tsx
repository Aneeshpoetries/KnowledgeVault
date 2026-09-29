'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Network,
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Brain,
  LogOut,
} from 'lucide-react';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

export default function LandingPage() {
  const pipeline = [
    { title: '1. Ingest', sub: 'PDF, DOCX, transcripts & slack notes', icon: Brain },
    { title: '2. Understand', sub: 'Structured extraction & failure modes', icon: Sparkles },
    { title: '3. Connect', sub: 'Topological Knowledge Graph', icon: Network },
    { title: '4. Assist', sub: 'Grounded RAG with strict citations', icon: Bot },
    { title: '5. Coverage', sub: '8-category mathematical resilience', icon: ShieldCheck },
    { title: '6. Exit Recovery', sub: 'Adaptive tacit knowledge interview', icon: LogOut },
  ];

  return (
    <div className="min-h-screen bg-vault-dark text-vault-text flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="border-b border-vault-border/80 bg-vault-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KnowledgeVaultLogo size={18} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-vault-text">
              KnowledgeVault
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-medium text-vault-muted hover:text-vault-text transition-colors"
          >
            Demo Personas
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Subtle Pill */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vault-surface border border-vault-border text-xs text-vault-muted mb-6 shadow-subtle"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Enterprise AI Knowledge Continuity System</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-vault-text max-w-3xl leading-[1.15]"
        >
          Turn employee experience into a living, searchable organizational memory.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-sm sm:text-base text-vault-muted max-w-2xl leading-relaxed"
        >
          When experienced engineers leave, organizations lose unwritten operational context.
          KnowledgeVault continuously captures, connects, and verifies critical tacit knowledge before it departs.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-medium text-white transition-all shadow-glowIndigo"
          >
            <span>Open Organizational Memory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vault-surface hover:bg-vault-subtle border border-vault-border text-xs sm:text-sm font-medium text-vault-text transition-colors"
          >
            <span>Evaluate 4 Demo Roles</span>
          </Link>
        </motion.div>

        {/* 6-Stage Continuity Architecture Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 w-full pt-10 border-t border-vault-border/60"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-vault-dim block mb-6">
            End-to-End Continuity Pipeline
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipeline.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-vault-surface border border-vault-border text-left space-y-1.5"
                >
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-semibold text-vault-text">{p.title}</h4>
                  <p className="text-[11px] text-vault-dim leading-snug">{p.sub}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-vault-border/60 py-6 text-center text-xs text-vault-dim font-mono">
        KnowledgeVault AI · Built for enterprise knowledge continuity and tacit resilience.
      </footer>
    </div>
  );
}
