'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bot,
  Network,
  ShieldAlert,
  PieChart,
  LogOut,
  Upload,
  Brain,
  FolderGit2,
  Users,
  Layers,
  ArrowRight,
  FileText,
  Command,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  category: 'Actions' | 'Knowledge' | 'People' | 'Projects' | 'Sources';
  icon: React.ReactNode;
  path: string;
}

const STATIC_ITEMS: PaletteItem[] = [
  // Actions
  {
    id: 'act-1',
    label: 'Ask KnowledgeVault',
    sublabel: 'Query organizational memory with grounded citations',
    category: 'Actions',
    icon: <Bot className="w-4 h-4 text-indigo-400" />,
    path: '/assistant',
  },
  {
    id: 'act-2',
    label: 'Start Exit Mode',
    sublabel: 'Conduct tacit knowledge recovery interview',
    category: 'Actions',
    icon: <LogOut className="w-4 h-4 text-amber-400" />,
    path: '/exit-mode',
  },
  {
    id: 'act-3',
    label: 'Open Knowledge Graph',
    sublabel: 'Explore connected employees, systems, and dependencies',
    category: 'Actions',
    icon: <Network className="w-4 h-4 text-cyan-400" />,
    path: '/graph',
  },
  {
    id: 'act-4',
    label: 'View Knowledge Gaps',
    sublabel: 'Review critical undocumented procedures',
    category: 'Actions',
    icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
    path: '/gaps',
  },
  {
    id: 'act-5',
    label: 'Capture / Ingest Source',
    sublabel: 'Upload incident reports, runbooks, or meeting transcripts',
    category: 'Actions',
    icon: <Upload className="w-4 h-4 text-emerald-400" />,
    path: '/capture',
  },
  // People
  {
    id: 'p-1',
    label: 'Rahul Sharma',
    sublabel: 'Staff Infrastructure Engineer · 73% Payment concentration',
    category: 'People',
    icon: <Users className="w-4 h-4 text-indigo-400" />,
    path: '/employees/cmuk9c89e00004yebedbz5ftx',
  },
  {
    id: 'p-2',
    label: 'Priya Mehta',
    sublabel: 'Lead Payment Architect · Stripe & PCI-DSS owner',
    category: 'People',
    icon: <Users className="w-4 h-4 text-emerald-400" />,
    path: '/employees/cmuk9c89e00014yebs280282h',
  },
  {
    id: 'p-3',
    label: 'Elena Rostova',
    sublabel: 'Staff Data Platform Engineer · Kafka DLQ owner',
    category: 'People',
    icon: <Users className="w-4 h-4 text-amber-400" />,
    path: '/employees/cmuk9c89e00034yebf8b0304c',
  },
  // Projects
  {
    id: 'proj-1',
    label: 'Payment System',
    sublabel: 'Tier-1 core transactional banking gateway',
    category: 'Projects',
    icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />,
    path: '/projects/cmuk9c8b700094yeb0pe39wbl',
  },
  {
    id: 'proj-2',
    label: 'Customer Portal',
    sublabel: 'B2B Client operations & auth suite',
    category: 'Projects',
    icon: <FolderGit2 className="w-4 h-4 text-cyan-400" />,
    path: '/projects/cmuk9c8ba000a4yebx5m70e5b',
  },
  {
    id: 'proj-3',
    label: 'Analytics Platform',
    sublabel: 'Real-time telemetry & financial reporting pipeline',
    category: 'Projects',
    icon: <FolderGit2 className="w-4 h-4 text-violet-400" />,
    path: '/projects/cmuk9c8bd000b4yebw0c53m4k',
  },
  // Knowledge
  {
    id: 'k-1',
    label: 'Payment API Gateway Timeout Configuration',
    sublabel: 'Runbook · 10,000ms threshold guard against 504 drops',
    category: 'Knowledge',
    icon: <Brain className="w-4 h-4 text-violet-400" />,
    path: '/knowledge',
  },
  {
    id: 'k-2',
    label: 'Kafka Dead Letter Queue Routing Strategy',
    sublabel: 'Decision · Exponential backoff & poison pill containment',
    category: 'Knowledge',
    icon: <Brain className="w-4 h-4 text-violet-400" />,
    path: '/knowledge',
  },
  {
    id: 'k-3',
    label: 'PostgreSQL PgBouncer Connection Sizing',
    sublabel: 'Troubleshooting · Preventing midnight pool exhaustion',
    category: 'Knowledge',
    icon: <Brain className="w-4 h-4 text-violet-400" />,
    path: '/knowledge',
  },
  // Sources
  {
    id: 's-1',
    label: 'Payment Deployment Incident Review – March 12',
    sublabel: 'Meeting Transcript · Post-mortem of timeout cascade',
    category: 'Sources',
    icon: <FileText className="w-4 h-4 text-cyan-400" />,
    path: '/sources',
  },
  {
    id: 's-2',
    label: 'Payment Service Architecture & Deployment Guide v3.4',
    sublabel: 'Runbook · Blue-green rolling release procedures',
    category: 'Sources',
    icon: <FileText className="w-4 h-4 text-cyan-400" />,
    path: '/sources',
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = STATIC_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.sublabel?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        onClose();
        router.push(current.path);
      }
    }
  };

  const categories: Array<'Actions' | 'Knowledge' | 'People' | 'Projects' | 'Sources'> = [
    'Actions',
    'Knowledge',
    'People',
    'Projects',
    'Sources',
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-vault-surface border border-vault-border rounded-xl shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-vault-border bg-vault-dark">
          <Search className="w-4 h-4 text-vault-dim shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search knowledge, people, projects, actions..."
            className="w-full bg-transparent text-sm text-vault-text placeholder:text-vault-dim focus:outline-none"
          />
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-vault-dim bg-vault-surface border border-vault-border shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-vault-border/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-vault-dim">
              No matching knowledge or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1.5 first:pt-0 last:pb-0">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                    {cat}
                  </div>
                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      const itemIdx = filteredItems.indexOf(item);
                      const isSelected = itemIdx === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            onClose();
                            router.push(item.path);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIdx)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-vault-subtle text-vault-text'
                              : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-vault-text truncate">
                                {item.label}
                              </p>
                              {item.sublabel && (
                                <p className="text-[11px] text-vault-dim truncate mt-0.5">
                                  {item.sublabel}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-vault-dim shrink-0 ml-2">
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-vault-border/60 bg-vault-dark flex items-center justify-between text-[11px] text-vault-dim font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>KnowledgeVault v1.0</span>
        </div>
      </div>
    </div>
  );
}
