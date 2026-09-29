'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Send,
  Plus,
  Brain,
  Check,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge, KnowledgeTypeBadge, ConfidenceBadge } from '@/components/ui/Badges';
import { ExtractedKnowledgeItemDTO } from '@/lib/types';

type CaptureTab = 'UPLOAD' | 'PASTE' | 'TELL_AI';

export default function CapturePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<CaptureTab>('UPLOAD');

  // File Upload Pipeline states
  const [file, setFile] = useState<File | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Paste Text state
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');

  // Extracted preview items state
  const [extractedItems, setExtractedItems] = useState<ExtractedKnowledgeItemDTO[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // "Tell AI" Conversational State (Section 34)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Tell me an unwritten rule, constraint, or troubleshooting trick that only you know. (e.g. "Never restart payment service during settlement")',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [capturedProposal, setCapturedProposal] = useState<any | null>(null);

  const processingSteps = [
    'Reading binary content...',
    'Extracting document text...',
    'AI semantic understanding...',
    'Structuring operational knowledge...',
    'Creating graph relationships...',
  ];

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setProcessing(true);
    setPipelineStep(processingSteps[0]);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('sourceType', 'DOCUMENT');

      setPipelineStep(processingSteps[1]);
      const uploadRes = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('File upload parsing failed');
      const uploadData = await uploadRes.json();

      setPipelineStep(processingSteps[2]);
      const extractRes = await fetch('/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: uploadData.sourceId,
          content: uploadData.extractedText,
          title: uploadedFile.name,
        }),
      });

      if (!extractRes.ok) throw new Error('AI extraction failed');
      const extractData = await extractRes.json();

      setPipelineStep(processingSteps[3]);
      await new Promise((r) => setTimeout(r, 400));

      setExtractedItems(extractData.items || []);
    } catch (err) {
      console.error('Processing failed:', err);
      alert('Failed to process document');
    } finally {
      setProcessing(false);
      setPipelineStep(null);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim() || processing) return;

    setProcessing(true);
    setPipelineStep('Ingesting text stream...');

    try {
      const res = await fetch('/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: pasteText.trim(),
          title: pasteTitle.trim() || 'Manual Operational Note',
          sourceType: 'NOTES',
        }),
      });

      const data = await res.json();
      setExtractedItems(data.items || []);
    } catch (err) {
      console.error('Paste extraction failed:', err);
      alert('Failed to process text');
    } finally {
      setProcessing(false);
      setPipelineStep(null);
    }
  };

  // Conversational Capture submission (Section 34)
  const handleChatSend = async (userText?: string) => {
    const text = userText || chatInput;
    if (!text.trim() || chatLoading) return;

    const nextMessages = [...chatMessages, { role: 'user' as const, content: text.trim() }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/conversational-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          userStatement: text.trim(),
        }),
      });

      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      if (data.isReady && data.extractedRecord) {
        setCapturedProposal(data.extractedRecord);
      }
    } catch (err) {
      console.error('Chat capture error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCommitProposal = async () => {
    if (!capturedProposal) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: capturedProposal.content || capturedProposal.summary,
          title: capturedProposal.title,
          sourceType: 'TACIT_KNOWLEDGE',
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => router.push('/knowledge'), 1200);
      }
    } catch {
      alert('Failed to commit knowledge');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header (Section 33) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Add to organizational memory
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Transform documents, transcripts, and undocumented intuition into verified structured knowledge.
            </p>
          </div>
        </div>

        {/* Three Large Modality Options (Section 33 & 34) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'UPLOAD'
                ? 'bg-vault-surface border-indigo-500 shadow-glowIndigo'
                : 'bg-vault-surface/60 border-vault-border hover:border-vault-border/90'
            }`}
          >
            <UploadCloud className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-xs sm:text-sm font-semibold text-vault-text">Upload Documents</h3>
            <p className="text-[11px] text-vault-muted mt-0.5">
              Drag &amp; drop PDF, DOCX, TXT, or Markdown runbooks.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PASTE')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'PASTE'
                ? 'bg-vault-surface border-indigo-500 shadow-glowIndigo'
                : 'bg-vault-surface/60 border-vault-border hover:border-vault-border/90'
            }`}
          >
            <FileText className="w-5 h-5 text-cyan-400 mb-2" />
            <h3 className="text-xs sm:text-sm font-semibold text-vault-text">Paste Text</h3>
            <p className="text-[11px] text-vault-muted mt-0.5">
              Paste meeting notes, Slack post-mortems, or chat threads.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TELL_AI')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === 'TELL_AI'
                ? 'bg-vault-surface border-indigo-500 shadow-glowIndigo'
                : 'bg-vault-surface/60 border-vault-border hover:border-vault-border/90'
            }`}
          >
            <Sparkles className="w-5 h-5 text-violet-400 mb-2" />
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-vault-text">Tell AI</h3>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Tacit
              </span>
            </div>
            <p className="text-[11px] text-vault-muted mt-0.5">
              Tell KnowledgeVault something only you know.
            </p>
          </button>
        </div>

        {/* Tab 1: Upload Workspace */}
        {activeTab === 'UPLOAD' && (
          <div className="p-8 rounded-xl bg-vault-surface border border-vault-border text-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-10 border-2 border-dashed border-vault-border hover:border-indigo-500/60 rounded-xl cursor-pointer transition-colors max-w-xl mx-auto space-y-2 bg-vault-dark/40"
            >
              <UploadCloud className="w-8 h-8 text-vault-dim mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-vault-text">
                Drop your documents here, or click to browse
              </p>
              <p className="text-[11px] text-vault-dim font-mono">
                Supports PDF, DOCX, Markdown, Text (up to 15MB)
              </p>
            </div>

            {processing && (
              <div className="max-w-md mx-auto p-4 rounded-lg bg-vault-dark border border-vault-border text-xs flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-mono text-vault-text">{pipelineStep}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Text Workspace */}
        {activeTab === 'PASTE' && (
          <form onSubmit={handlePasteSubmit} className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                Document / Incident Title
              </label>
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="e.g. Payment Gateway March 12 Incident Review"
                className="w-full bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-vault-text focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-vault-dim block mb-1">
                Content Stream
              </label>
              <textarea
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste raw meeting notes, terminal sessions, or Slack incident channels..."
                className="w-full bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg p-3 text-xs text-vault-text focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!pasteText.trim() || processing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-medium text-white transition-all shadow-glowIndigo"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{processing ? 'Extracting knowledge...' : 'Extract Operational Memory'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Tell AI Conversational Capture Workspace (Section 34) */}
        {activeTab === 'TELL_AI' && (
          <div className="p-6 rounded-xl bg-vault-surface border border-vault-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-vault-text">
                  Tacit Knowledge Interview
                </span>
              </div>
              <span className="text-[10px] font-mono text-vault-dim">Turn-by-turn capture</span>
            </div>

            {/* Conversation turns */}
            <div className="space-y-3 max-h-80 overflow-y-auto p-2">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg p-3 rounded-xl text-xs ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-vault-dark text-vault-text border border-vault-border'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-vault-dark border border-vault-border text-xs text-vault-dim flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                    <span>Analyzing operational context...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Structured Proposal Preview when ready */}
            {capturedProposal && (
              <div className="p-4 rounded-xl bg-vault-dark border border-indigo-500/40 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">
                    Structured Knowledge Proposal
                  </span>
                  <RiskBadge risk={capturedProposal.risk || 'HIGH'} />
                </div>
                <h4 className="font-semibold text-vault-text text-sm">{capturedProposal.title}</h4>
                <p className="text-vault-muted leading-relaxed">{capturedProposal.content || capturedProposal.summary}</p>

                <div className="pt-2 border-t border-vault-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-vault-dim">Ready to commit to organizational memory</span>
                  <button
                    type="button"
                    onClick={handleCommitProposal}
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Saved to Memory!' : 'Approve & Save'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleChatSend();
                }}
                placeholder="Type your tacit operational knowledge..."
                className="flex-1 bg-vault-dark border border-vault-border focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-vault-text focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleChatSend()}
                disabled={!chatInput.trim() || chatLoading}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Extracted Items Review (Section 13 & 33) */}
        {extractedItems.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vault-text">
                Extracted Knowledge Items ({extractedItems.length})
              </h3>
              <Link
                href="/knowledge"
                className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Browse in repository</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-vault-border bg-vault-surface divide-y divide-vault-border/40">
              {extractedItems.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <KnowledgeTypeBadge type={item.type} />
                      <h4 className="text-xs sm:text-sm font-semibold text-vault-text truncate">{item.title}</h4>
                    </div>
                    <p className="text-xs text-vault-muted line-clamp-1">{item.summary || item.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge risk={item.risk} />
                    <ConfidenceBadge confidence={item.confidence} />
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
