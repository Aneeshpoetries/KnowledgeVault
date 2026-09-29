'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Shield,
  Sliders,
  Database,
  Lock,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Save,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'WORKSPACE' | 'AI' | 'KNOWLEDGE' | 'SECURITY' | 'APPEARANCE'>('AI');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState('0.15');
  const [provider, setProvider] = useState<'OpenAI' | 'Demo Mode'>('OpenAI');
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.ai?.model) setModel(data.ai.model);
        if (data.ai?.temperature) setTemperature(data.ai.temperature.toString());
        setProvider(data.ai?.provider || 'OpenAI');
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'WORKSPACE', label: 'Workspace' },
    { id: 'AI', label: 'AI Intelligence' },
    { id: 'KNOWLEDGE', label: 'Knowledge Governance' },
    { id: 'SECURITY', label: 'Security & Access' },
    { id: 'APPEARANCE', label: 'Appearance' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Settings &amp; Governance
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Configure AI intelligence providers, operational decay windows, and workspace governance.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        {/* Section 60: Two-Column Settings Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Settings Navigation Tabs (cols 3) */}
          <div className="md:col-span-3 space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === sec.id
                    ? 'bg-vault-surface text-vault-text border border-vault-border shadow-subtle'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Settings Content Area (cols 9) */}
          <div className="md:col-span-9 p-6 rounded-xl bg-vault-surface border border-vault-border space-y-6">
            {/* AI Settings Section */}
            {activeSection === 'AI' && (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-vault-text">AI Provider &amp; Model Engine</h3>
                  <p className="text-xs text-vault-dim mt-0.5">
                    Select how organizational memory executes RAG queries and tacit extraction.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                      Active AI Engine Provider
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setProvider('OpenAI')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          provider === 'OpenAI'
                            ? 'bg-vault-dark border-indigo-500 text-vault-text'
                            : 'bg-vault-dark/50 border-vault-border text-vault-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-vault-text">OpenAI / LLM API</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-[11px] text-vault-dim">
                          Real multimodal inference with OPENAI_API_KEY environment binding.
                        </p>
                      </div>

                      <div
                        onClick={() => setProvider('Demo Mode')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          provider === 'Demo Mode'
                            ? 'bg-vault-dark border-indigo-500 text-vault-text'
                            : 'bg-vault-dark/50 border-vault-border text-vault-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-vault-text">Local Demo Engine</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </div>
                        <p className="text-[11px] text-vault-dim">
                          Deterministic heuristic fallback engine ensuring 100% offline evaluation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                        Completion Model
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-vault-text focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                        Sampling Temperature
                      </label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-vault-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                      Vector Embeddings Architecture
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Deterministic Tokenized N-Gram Semantic Vectorizer (Cosine Distance)"
                      className="w-full bg-vault-dark border border-vault-border/60 rounded-lg px-3 py-2 text-xs font-mono text-vault-dim"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-vault-border/60 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-glowIndigo"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* Workspace Profile */}
            {activeSection === 'WORKSPACE' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-vault-text">Workspace Profile</h3>
                  <p className="text-xs text-vault-dim mt-0.5">Enterprise organization settings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      disabled
                      value="NovaTech Systems Inc."
                      className="w-full bg-vault-dark border border-vault-border rounded-lg px-3 py-2 text-vault-text font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                      Continuity Tier
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Enterprise Memory & Exit Protection"
                      className="w-full bg-vault-dark border border-vault-border rounded-lg px-3 py-2 text-vault-text font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Knowledge Governance */}
            {activeSection === 'KNOWLEDGE' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-semibold text-vault-text">Knowledge Decay &amp; Verification Windows</h3>
                  <p className="text-xs text-vault-dim mt-0.5">Set operational freshness expiration periods.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-[10px] font-mono text-vault-dim block">Freshness Baseline Window</span>
                    <span className="text-base font-semibold font-mono text-vault-text mt-1 block">60 Days</span>
                  </div>
                  <div className="p-3 rounded-lg bg-vault-dark border border-vault-border">
                    <span className="text-[10px] font-mono text-vault-dim block">Critical Stale Alert Window</span>
                    <span className="text-base font-semibold font-mono text-amber-400 mt-1 block">120 Days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'SECURITY' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-semibold text-vault-text">Security &amp; Data Isolation</h3>
                  <p className="text-xs text-vault-dim mt-0.5">Role-based controls and audit posture.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-vault-dark border border-vault-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-vault-text">Zero Data Retention to 3rd-Party LLMs</span>
                    <span className="text-[10px] font-mono text-emerald-400">ENFORCED</span>
                  </div>
                  <p className="text-[11px] text-vault-muted">
                    No prompt data or organizational excerpts are stored or trained upon.
                  </p>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'APPEARANCE' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-vault-text">Appearance &amp; Theme</h3>
                  <p className="text-xs text-vault-dim mt-0.5">
                    Select your visual theme preference. The setting is persisted and applied across all views.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      theme === 'dark'
                        ? 'bg-vault-surface border-indigo-500 text-vault-text ring-1 ring-indigo-500/50 shadow-subtle'
                        : 'bg-vault-dark/40 border-vault-border text-vault-muted hover:border-vault-border/90 hover:text-vault-text'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">Dark Mode</span>
                        {theme === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-vault-dim">Obsidian &amp; deep navy</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      theme === 'light'
                        ? 'bg-vault-surface border-indigo-500 text-vault-text ring-1 ring-indigo-500/50 shadow-subtle'
                        : 'bg-vault-dark/40 border-vault-border text-vault-muted hover:border-vault-border/90 hover:text-vault-text'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">Light Mode</span>
                        {theme === 'light' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-vault-dim">Airy clean minimal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      theme === 'system'
                        ? 'bg-vault-surface border-indigo-500 text-vault-text ring-1 ring-indigo-500/50 shadow-subtle'
                        : 'bg-vault-dark/40 border-vault-border text-vault-muted hover:border-vault-border/90 hover:text-vault-text'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">System Default</span>
                        {theme === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                      <span className="text-[10px] text-vault-dim">
                        Currently: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-vault-dark border border-vault-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-vault-text">Active Theme Setting</span>
                    <p className="text-[11px] text-vault-dim mt-0.5">
                      Selected: <span className="font-mono text-indigo-400 uppercase">{theme}</span> · Resolved: <span className="font-mono text-cyan-400 uppercase">{resolvedTheme}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-vault-surface border border-vault-border text-vault-muted">
                    CSS Variables Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
