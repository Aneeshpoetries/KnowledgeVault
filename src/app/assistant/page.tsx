'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  FileText,
  ExternalLink,
  ChevronRight,
  Plus,
  Network,
  User,
  FolderGit2,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ConfidenceBadge } from '@/components/ui/Badges';
import { ChatAnswerResponse } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responsePayload?: ChatAnswerResponse;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  'How do I recover the payment service?',
  'What does Rahul know about Kafka?',
  'Which production procedures are undocumented?',
  'Who owns customer authentication?',
];

const SEARCH_STAGES = [
  'Searching organizational memory...',
  'Checking verified sources...',
  'Connecting related context...',
  'Preparing grounded answer...',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Ask any operational question. I answer strictly from verified runbooks, incident reviews, and employee experience with complete citations.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStageIdx, setSearchStageIdx] = useState(0);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const [activePayload, setActivePayload] = useState<ChatAnswerResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setSearchStageIdx(0);
      interval = setInterval(() => {
        setSearchStageIdx((prev) => (prev < SEARCH_STAGES.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q || q.trim().length === 0 || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      });

      const data: ChatAnswerResponse = await res.json();

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        responsePayload: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActivePayload(data);
      if (data.citations && data.citations.length > 0) {
        setSelectedCitation(data.citations[0]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'KnowledgeVault encountered a temporary connectivity interruption. Please retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4 animate-in fade-in duration-150">
        {/* LEFT COLUMN: Clean Conversation Stream (cols 8 on lg) */}
        <div className="flex-1 flex flex-col bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
          {/* Assistant Header */}
          <div className="px-5 py-3.5 border-b border-vault-border bg-vault-dark flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-vault-text">Ask Organizational Memory</h2>
                <p className="text-[10px] text-vault-dim">Grounded RAG with anti-hallucination citations</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Continuity Engine Online
              </span>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const payload = msg.responsePayload;

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-medium shadow-sm">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              // Assistant Response (Section 17 Structured Layout)
              return (
                <div key={msg.id} className="flex items-start gap-3 max-w-2xl">
                  <div className="w-6 h-6 rounded-md bg-vault-border flex items-center justify-center text-vault-muted shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>

                  <div className="flex-1 space-y-4 text-xs sm:text-sm">
                    {/* ANSWER SECTION */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block mb-1">
                        Answer
                      </span>
                      <div className="text-vault-text leading-relaxed whitespace-pre-line">
                        {payload ? payload.answer : msg.text}
                      </div>
                    </div>

                    {/* WHY SECTION */}
                    {payload?.why && (
                      <div className="pt-2 border-t border-vault-border/60">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-vault-dim block mb-1">
                          Why
                        </span>
                        <div className="text-xs text-vault-muted leading-relaxed">
                          {payload.why}
                        </div>
                      </div>
                    )}

                    {/* CITATIONS / EVIDENCE SECTION */}
                    {payload?.citations && payload.citations.length > 0 && (
                      <div className="pt-2 border-t border-vault-border/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                            Evidence &amp; Citations ({payload.citations.length})
                          </span>
                          <span className="text-[10px] text-vault-dim">Click to inspect excerpt</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {payload.citations.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSelectedCitation(c);
                                setActivePayload(payload);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                                selectedCitation?.sourceName === c.sourceName
                                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-600/50'
                                  : 'bg-vault-dark text-vault-dim border-vault-border hover:text-vault-text'
                              }`}
                            >
                              <FileText className="w-3 h-3 text-cyan-400" />
                              <span className="truncate max-w-[160px]">{c.sourceName}</span>
                              <span className="text-[9px] text-cyan-400">[{i + 1}]</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONFIDENCE & METADATA */}
                    {payload && typeof payload.confidence === 'number' && (
                      <div className="pt-2 border-t border-vault-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase text-vault-dim">
                            Confidence:
                          </span>
                          <ConfidenceBadge
                            confidence={payload.confidence}
                            sourceTitle={payload.citations?.[0]?.sourceName}
                          />
                        </div>

                        <span className="text-[10px] text-vault-dim font-mono">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* NO ANSWER / KNOWLEDGE GAP DETECTED BEHAVIOR (Section 50) */}
                    {(payload?.knowledgeGapDetected ||
                      (payload && payload.isSufficientEvidence === false)) && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Knowledge Gap Detected</span>
                        </div>
                        <p className="text-[11px] text-vault-muted">
                          {payload.gapDetails?.description ||
                            'I could not find enough verified organizational knowledge to answer this with certainty.'}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href="/capture"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Capture missing knowledge</span>
                          </Link>
                          <Link
                            href="/exit-mode"
                            className="text-[11px] text-vault-dim hover:text-vault-text transition-colors"
                          >
                            Assign to departing owner →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* RAG Animated Thinking State (Section 18 & 19) */}
            {loading && (
              <div className="flex items-start gap-3 max-w-xl">
                <div className="w-6 h-6 rounded-md bg-vault-border flex items-center justify-center text-vault-muted shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-vault-dark border border-vault-border flex items-center gap-2.5 text-xs text-vault-muted">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-mono text-vault-text">
                    {SEARCH_STAGES[searchStageIdx]}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Pills */}
          <div className="px-4 py-2 border-t border-vault-border/60 bg-vault-dark/50 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim shrink-0">
              Suggested:
            </span>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-md text-[11px] text-vault-dim hover:text-vault-text bg-vault-surface border border-vault-border hover:border-vault-border/90 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-vault-border bg-vault-surface">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What do you need to know from organizational memory?"
                className="flex-1 bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-vault-text placeholder:text-vault-dim focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-glowIndigo"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence & Context Drawer (cols 4 on lg) */}
        <div className="w-full lg:w-80 flex flex-col bg-vault-surface border border-vault-border rounded-xl p-4 space-y-4 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-vault-dim">
              Evidence Inspector
            </span>
            <span className="text-[10px] font-mono text-cyan-400">RAG Grounded</span>
          </div>

          {selectedCitation ? (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="p-3 rounded-lg bg-vault-dark border border-vault-border space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{selectedCitation.sourceName}</span>
                </div>
                <span className="text-[10px] font-mono text-vault-dim block">
                  Author / Reviewer: {selectedCitation.employeeName || 'Engineering Team'}
                </span>
                <p className="text-[11px] text-vault-dim italic bg-vault-surface p-2 rounded border border-vault-border/60 max-h-36 overflow-y-auto font-mono">
                  &ldquo;{selectedCitation.snippet || selectedCitation.excerpt}&rdquo;
                </p>
              </div>

              {/* Related Knowledge Links */}
              {activePayload?.relatedKnowledge && activePayload.relatedKnowledge.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block">
                    Related Knowledge ({activePayload.relatedKnowledge.length})
                  </span>
                  <div className="space-y-1">
                    {activePayload.relatedKnowledge.map((rk, idx) => (
                      <Link
                        key={idx}
                        href={`/knowledge/${rk.id}`}
                        className="block p-2 rounded-md bg-vault-dark hover:bg-vault-subtle border border-vault-border/60 text-xs transition-colors"
                      >
                        <p className="font-medium text-vault-text truncate">{rk.title}</p>
                        <span className="text-[10px] text-vault-dim">{rk.type}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Graph Navigation Link (Section 51) */}
              <div className="pt-2 border-t border-vault-border/60">
                <Link
                  href={`/graph?focus=${encodeURIComponent(selectedCitation.sourceName)}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-vault-dark hover:bg-vault-subtle border border-vault-border text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Explore in Knowledge Graph →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-vault-dim space-y-2">
              <FileText className="w-6 h-6 text-vault-dim mx-auto opacity-30" />
              <p>Ask a question to inspect live evidence citations.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
