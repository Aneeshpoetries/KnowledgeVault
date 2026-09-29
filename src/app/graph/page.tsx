'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  Search,
  Filter,
  Users,
  FolderGit2,
  Cpu,
  Brain,
  FileText,
  AlertTriangle,
  X,
  Sparkles,
  ChevronRight,
  Focus,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';
import { useTheme } from '@/context/ThemeContext';

// Custom Minimal Node Component (Section 20)
function CustomCompactNode({ data }: { data: any }) {
  const type = data.type || 'KNOWLEDGE';
  const isSelected = data.isSelected;
  const isDimmed = data.isDimmed;

  const accentColor =
    type === 'EMPLOYEE'
      ? 'border-indigo-500/60 text-indigo-400 bg-indigo-500/10'
      : type === 'PROJECT'
      ? 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10'
      : type === 'TECHNOLOGY'
      ? 'border-amber-500/60 text-amber-400 bg-amber-500/10'
      : type === 'PROBLEM'
      ? 'border-red-500/60 text-red-400 bg-red-500/10'
      : type === 'SOLUTION'
      ? 'border-cyan-500/60 text-cyan-400 bg-cyan-500/10'
      : 'border-violet-500/60 text-violet-400 bg-violet-500/10';

  return (
    <div
      className={`px-3 py-1.5 rounded-lg border bg-vault-surface transition-all duration-200 select-none cursor-pointer ${
        isDimmed
          ? 'opacity-20 scale-95 border-vault-border'
          : isSelected
          ? 'ring-2 ring-indigo-500 shadow-glowIndigo scale-105 border-indigo-400'
          : 'hover:border-vault-border/90 hover:scale-102 border-vault-border'
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-2">
        <span className={`p-1 rounded text-xs border ${accentColor} shrink-0`}>
          {type === 'EMPLOYEE' && <Users className="w-3 h-3" />}
          {type === 'PROJECT' && <FolderGit2 className="w-3 h-3" />}
          {type === 'TECHNOLOGY' && <Cpu className="w-3 h-3" />}
          {type === 'KNOWLEDGE' && <Brain className="w-3 h-3" />}
          {type === 'PROBLEM' && <AlertTriangle className="w-3 h-3" />}
          {type === 'SOLUTION' && <Sparkles className="w-3 h-3" />}
        </span>
        <div className="truncate max-w-[140px]">
          <p className="text-xs font-medium text-vault-text truncate">{data.label}</p>
          <span className="text-[9px] font-mono text-vault-dim uppercase">{type}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomCompactNode,
};

export default function KnowledgeGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [focusMode, setFocusMode] = useState(false);
  const { resolvedTheme } = useTheme();

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/graph?${params.toString()}`);
      const data = await res.json();

      const rawNodes = data.nodes || [];
      const rawEdges = data.edges || [];

      // Tiered coordinates calculation
      const flowNodes: any[] = rawNodes.map((n: any, idx: number) => {
        const angle = (idx / Math.max(1, rawNodes.length)) * 2 * Math.PI;
        const radius =
          n.type === 'EMPLOYEE'
            ? 120
            : n.type === 'PROJECT'
            ? 240
            : n.type === 'TECHNOLOGY'
            ? 340
            : 440;
        const x = 500 + radius * Math.cos(angle) + (idx % 2 === 0 ? 25 : -25);
        const y = 350 + radius * Math.sin(angle) + (idx % 3 === 0 ? 20 : -20);

        return {
          id: n.id,
          type: 'custom',
          position: { x, y },
          data: {
            ...n,
            label: n.name || n.title,
            isSelected: false,
            isDimmed: false,
          },
        };
      });

      const flowEdges = rawEdges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        animated: e.type === 'OWNS' || e.type === 'RESOLVES',
        style: {
          stroke: e.type === 'CONFLICTS_WITH' ? '#EF4444' : '#6366F1',
          strokeWidth: 1.2,
          opacity: 0.6,
        },
        labelStyle: {
          fill: '#94A3B8',
          fontSize: 9,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#080B12',
          fillOpacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.type === 'CONFLICTS_WITH' ? '#EF4444' : '#6366F1',
          width: 14,
          height: 14,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Node Click: Highlight connected lineage and dim everything else (Section 21)
  const onNodeClick = useCallback(
    (_: any, node: any) => {
      setSelectedNode(node.data);

      if (focusMode) {
        // Find connected node IDs
        const connectedIds = new Set<string>([node.id]);
        edges.forEach((e: any) => {
          if (e.source === node.id) connectedIds.add(e.target);
          if (e.target === node.id) connectedIds.add(e.source);
        });

        setNodes((nds) =>
          nds.map((n: any) => ({
            ...n,
            data: {
              ...n.data,
              isSelected: n.id === node.id,
              isDimmed: !connectedIds.has(n.id),
            },
          }))
        );
      } else {
        setNodes((nds) =>
          nds.map((n: any) => ({
            ...n,
            data: {
              ...n.data,
              isSelected: n.id === node.id,
              isDimmed: false,
            },
          }))
        );
      }
    },
    [focusMode, edges, setNodes]
  );

  const resetSelection = () => {
    setSelectedNode(null);
    setNodes((nds) =>
      nds.map((n: any) => ({
        ...n,
        data: { ...n.data, isSelected: false, isDimmed: false },
      }))
    );
  };

  const types = [
    { label: 'All', value: 'ALL' },
    { label: 'Employees', value: 'EMPLOYEE' },
    { label: 'Projects', value: 'PROJECT' },
    { label: 'Technologies', value: 'TECHNOLOGY' },
    { label: 'Knowledge', value: 'KNOWLEDGE' },
  ];

  return (
    <AppShell>
      <div className="space-y-4 animate-in fade-in duration-150">
        {/* Graph Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-vault-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-vault-text">
              Knowledge Graph
            </h1>
            <p className="text-xs sm:text-sm text-vault-muted mt-0.5">
              Interactive topological map of people, systems, technologies, and unwritten operational experience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFocusMode(!focusMode);
                if (selectedNode) {
                  // Toggle focus on currently selected node
                  const connectedIds = new Set<string>([selectedNode.id]);
                  edges.forEach((e: any) => {
                    if (e.source === selectedNode.id) connectedIds.add(e.target);
                    if (e.target === selectedNode.id) connectedIds.add(e.source);
                  });
                  setNodes((nds) =>
                    nds.map((n: any) => ({
                      ...n,
                      data: {
                        ...n.data,
                        isDimmed: !focusMode ? !connectedIds.has(n.id) : false,
                      },
                    }))
                  );
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                focusMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-glowIndigo'
                  : 'bg-vault-surface text-vault-muted border-vault-border hover:text-vault-text'
              }`}
              title="Focus Mode dims unrelated entities and highlights lineage"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>{focusMode ? 'Focus Mode Active' : 'Focus Mode'}</span>
            </button>

            {selectedNode && (
              <button
                onClick={resetSelection}
                className="p-1.5 rounded-lg text-vault-dim hover:text-vault-text bg-vault-surface border border-vault-border"
                title="Reset selection"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-vault-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: 'Who knows about Kafka?', 'Payment timeout', 'Rahul'..."
              className="w-full bg-vault-surface border border-vault-border hover:border-vault-border/90 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-vault-text placeholder:text-vault-dim focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === t.value
                    ? 'bg-vault-border text-vault-text border border-vault-border'
                    : 'text-vault-muted hover:text-vault-text hover:bg-vault-subtle/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas & Drawer Container */}
        <div className="relative h-[650px] w-full rounded-xl border border-vault-border bg-vault-dark overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-vault-dark/60 backdrop-blur-xs text-xs font-mono text-vault-dim">
              Computing graph topology...
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            {/* Subtle technical background grid */}
            <Background gap={24} size={1} color={resolvedTheme === 'light' ? '#CBD5E1' : '#1E2638'} />
            <Controls className="!bg-vault-surface !border-vault-border !text-vault-text !fill-vault-text" />
          </ReactFlow>

          {/* Right Detail Drawer (Section 20) */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-80 bg-vault-surface border border-vault-border rounded-xl shadow-elevated p-4 z-20 animate-in slide-in-from-right-4 duration-150 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-vault-border/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-vault-dim">
                  Node Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-vault-dim hover:text-vault-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block mb-1">
                  {selectedNode.type}
                </span>
                <h3 className="text-sm font-semibold text-vault-text">
                  {selectedNode.label || selectedNode.name || selectedNode.title}
                </h3>
                {selectedNode.role && (
                  <p className="text-xs text-vault-muted mt-0.5">{selectedNode.role}</p>
                )}
                {selectedNode.summary && (
                  <p className="text-xs text-vault-muted mt-1 line-clamp-3">
                    {selectedNode.summary}
                  </p>
                )}
              </div>

              {selectedNode.risk && (
                <div className="pt-2 border-t border-vault-border/60 flex items-center justify-between">
                  <span className="text-xs text-vault-dim">Risk Level:</span>
                  <RiskBadge risk={selectedNode.risk} />
                </div>
              )}

              {selectedNode.type === 'EMPLOYEE' && (
                <div className="pt-2 border-t border-vault-border/60 space-y-2">
                  <Link
                    href={`/exit-mode/${selectedNode.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                  >
                    <span>Start Exit Interview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {selectedNode.type === 'KNOWLEDGE' && (
                <div className="pt-2 border-t border-vault-border/60">
                  <Link
                    href={`/knowledge/${selectedNode.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <span>View Evidence Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
