'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Network, Users, CheckCircle2,
  ShieldCheck, Bot, Brain, LogOut,
} from 'lucide-react';
import { KnowledgeVaultLogo } from '@/components/ui/KnowledgeVaultLogo';

export default function LandingPage() {
  const pipeline = [
    { title: '1. Ingest',        sub: 'PDF, DOCX, transcripts & slack notes',      icon: Brain,      color: 'bg-[#F8D4A7]' },
    { title: '2. Understand',    sub: 'Structured extraction & failure modes',      icon: Sparkles,   color: 'bg-[#C8A2F9]' },
    { title: '3. Connect',       sub: 'Topological Knowledge Graph',                icon: Network,    color: 'bg-[#A0C4F6]' },
    { title: '4. Assist',        sub: 'Grounded RAG with strict citations',          icon: Bot,        color: 'bg-[#F8BFA5]' },
    { title: '5. Coverage',      sub: '8-category mathematical resilience',          icon: ShieldCheck,color: 'bg-[#F59ED5]' },
    { title: '6. Exit Recovery', sub: 'Adaptive tacit knowledge interview',          icon: LogOut,     color: 'bg-[#F391AC]' },
  ];

  const stats = [
    { value: '73%',    label: 'avg knowledge held by single engineer' },
    { value: '6 days', label: 'to capture complete runbook via AI interview' },
    { value: '4 roles', label: 'RBAC personas, full org coverage' },
  ];

  return (
    <div className="min-h-screen bg-[var(--vault-bg)] text-vault-text flex flex-col overflow-x-hidden selection:bg-[#C8A2F9]/30">

      {/* ── Ambient blobs ── */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#F8D4A7]/25 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[#C8A2F9]/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />
      <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] bg-[#A0C4F6]/15 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* ── Navbar ── */}
      <nav className="border-b border-vault-border/60 bg-[var(--vault-bg)]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#F8D4A7] flex items-center justify-center shadow-sm">
            <KnowledgeVaultLogo size={18} className="text-[#7a5510]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] tracking-tight text-vault-text">KnowledgeVault</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C8A2F9]/25 text-[#4a1a8b] border border-[#C8A2F9]/40">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-semibold text-vault-muted hover:text-vault-text transition-colors hidden sm:block">
            Demo Personas
          </Link>
          <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vault-text text-vault-dark text-[13px] font-bold transition-all hover:opacity-85 shadow-card">
            Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center w-full">

        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vault-surface border border-vault-border text-[12px] font-semibold text-vault-muted mb-7 shadow-card"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A2F9] animate-pulse" />
          Enterprise AI Knowledge Continuity System
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-vault-text max-w-3xl leading-[1.12]"
        >
          Turn employee experience into a living,{' '}
          <span className="relative inline-block">
            <span className="relative z-10">searchable memory.</span>
            <span className="absolute inset-x-0 bottom-1 h-3 bg-[#F8D4A7]/60 rounded-sm -z-0" />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-[14px] sm:text-[15px] text-vault-muted max-w-xl leading-relaxed"
        >
          When experienced engineers leave, organizations lose unwritten operational context.
          KnowledgeVault captures, connects, and verifies critical tacit knowledge before it departs.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-vault-text text-vault-dark text-[14px] font-bold transition-all hover:opacity-85 shadow-card">
            Open Organizational Memory <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-vault-surface border border-vault-border hover:bg-vault-subtle text-[14px] font-semibold text-vault-text transition-colors shadow-card">
            Evaluate 4 Demo Roles
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-3 gap-4 w-full max-w-lg"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[22px] font-bold text-vault-text">{s.value}</div>
              <div className="text-[11px] text-vault-muted mt-0.5 leading-snug">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Pipeline cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 w-full pt-10 border-t border-vault-border/60"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-vault-dim block mb-6">
            End-to-End Continuity Pipeline
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipeline.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.06 }}
                  className={`${p.color} rounded-[1.25rem] p-4 text-left space-y-2.5 hover:scale-[1.03] transition-transform shadow-sm cursor-default`}
                >
                  <div className="w-7 h-7 bg-black/8 rounded-full flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-gray-800" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-900">{p.title}</h4>
                    <p className="text-[10px] text-gray-700/75 leading-snug mt-0.5">{p.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feature callouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
        >
          {[
            { icon: Brain,     color: 'bg-[#F8D4A7]', title: 'AI Knowledge Extraction',  desc: 'Converts raw documents, transcripts, and Slack threads into structured, verified runbooks.' },
            { icon: Network,   color: 'bg-[#A0C4F6]', title: 'Knowledge Graph',            desc: 'Topological map of who knows what — surface single-point-of-failure engineers instantly.' },
            { icon: ShieldCheck,color:'bg-[#C8A2F9]', title: 'Exit Mode Recovery',         desc: 'Adaptive AI interviews departing engineers to extract unwritten procedures before they leave.' },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-[1.5rem] bg-vault-surface border border-vault-border text-left shadow-card hover:shadow-lg transition-shadow">
              <div className={`w-10 h-10 ${f.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                <f.icon className="w-4.5 h-4.5 text-gray-800" size={18} />
              </div>
              <h3 className="text-[14px] font-bold text-vault-text mb-1.5">{f.title}</h3>
              <p className="text-[12px] text-vault-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-vault-border/60 py-6 text-center text-[12px] text-vault-dim">
        KnowledgeVault AI · Built for enterprise knowledge continuity and tacit resilience.
      </footer>
    </div>
  );
}
