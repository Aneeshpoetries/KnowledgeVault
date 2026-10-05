'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import '@xyflow/react/dist/style.css';
import {
  Network, Search, Users, FolderGit2, Cpu, Brain,
  AlertTriangle, X, Sparkles, ChevronRight, Focus,
  RotateCcw, BookOpen, ZoomIn, LayoutGrid
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { RiskBadge } from '@/components/ui/Badges';

/* ─── Compact Palette ─────────────────────────────────────────────── */
const PALETTE: Record<string, { bg: string; border: string; text: string }> = {
  EMPLOYEE:      { bg: '#e9d5ff', border: '#c084fc', text: '#581c87' }, // purple
  PROJECT:       { bg: '#bfdbfe', border: '#60a5fa', text: '#1e3a8a' }, // blue
  TECHNOLOGY:    { bg: '#fde68a', border: '#fbbf24', text: '#78350f' }, // amber
  KNOWLEDGE:     { bg: '#fecaca', border: '#f87171', text: '#7f1d1d' }, // red
  DOCUMENTATION: { bg: '#fbcfe8', border: '#f472b6', text: '#831843' }, // pink
  PROBLEM:       { bg: '#fca5a5', border: '#ef4444', text: '#7f1d1d' }, // red-dark
  SOLUTION:      { bg: '#bbf7d0', border: '#4ade80', text: '#14532d' }, // green
};

const NODE_W = 160;
const NODE_H = 34;

/* ─── Dagre layout ────────────────────────────────────────────────── */
async function layoutNodes(
  rawNodes: any[],
  rawEdges: any[],
  direction: 'TB' | 'LR' = 'LR',
) {
  const dagre = (await import('@dagrejs/dagre')).default;
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  
  // Tightly packed vertically, spaced horizontally for that perfect grid look
  g.setGraph({ 
    rankdir: direction, 
    nodesep: 15,       // Tight vertical packing
    ranksep: 120,      // Distinct columns
    marginx: 50, 
    marginy: 50 
  });
  
  rawNodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  rawEdges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  
  return rawNodes.map((n) => {
    const p = g.node(n.id);
    return { ...n, x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 };
  });
}

/* ─── Custom Block Node ───────────────────────────────────────────── */
const KnowledgeNode = memo(function KnowledgeNode({
  node, selected, dimmed, onClick,
}: {
  node: any; selected: boolean; dimmed: boolean; onClick: (n: any) => void;
}) {
  const pal = PALETTE[node.nodeType] || PALETTE.KNOWLEDGE;
  const isHighRisk = node.risk === 'CRITICAL' || node.risk === 'HIGH';

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      style={{ cursor: 'pointer', opacity: dimmed ? 0.15 : 1, transition: 'opacity 0.2s' }}
      onClick={() => onClick(node)}
    >
      {/* Node Body */}
      <rect
        width={NODE_W} height={NODE_H} rx={6}
        fill={pal.bg}
        stroke={selected ? '#1a1207' : pal.border}
        strokeWidth={selected ? 2 : 1.5}
      />
      
      {/* Risk Indicator Strip */}
      {isHighRisk && (
        <rect x={0} y={0} width={6} height={NODE_H} fill="#ef4444" rx={2} />
      )}

      {/* Selection Glow */}
      {selected && (
        <rect width={NODE_W + 6} height={NODE_H + 6} x={-3} y={-3} rx={8} fill="none"
          stroke={pal.border} strokeWidth={3} strokeOpacity={0.4} />
      )}

      {/* Label */}
      <text x={isHighRisk ? 12 : 8} y={NODE_H / 2 + 1} fontSize={11} fontWeight={600}
        fill={pal.text} fontFamily="Inter, sans-serif"
        style={{ dominantBaseline: 'middle' }}>
        <title>{node.label}</title>
        {node.label?.length > 22 ? node.label.slice(0, 22) + '…' : node.label}
      </text>

      {/* Connection points (visual only) */}
      <circle cx={0} cy={NODE_H / 2} r={2.5} fill={pal.border} />
      <circle cx={NODE_W} cy={NODE_H / 2} r={2.5} fill={pal.border} />
    </g>
  );
});

/* ─── Orthogonal Edge Renderer ────────────────────────────────────── */
function EdgeLine({ edge, nodes, layoutDir }: { edge: any; nodes: any[]; layoutDir: 'LR' | 'TB' }) {
  const src = nodes.find((n) => n.id === edge.source);
  const tgt = nodes.find((n) => n.id === edge.target);
  if (!src || !tgt) return null;

  let x1, y1, x2, y2, d;
  
  if (layoutDir === 'LR') {
    x1 = src.x + NODE_W;
    y1 = src.y + NODE_H / 2;
    x2 = tgt.x;
    y2 = tgt.y + NODE_H / 2;
    
    // Orthogonal routing (Right, Down/Up, Right)
    const midX = x1 + (x2 - x1) / 2;
    d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  } else {
    x1 = src.x + NODE_W / 2;
    y1 = src.y + NODE_H;
    x2 = tgt.x + NODE_W / 2;
    y2 = tgt.y;
    
    // Orthogonal routing (Down, Right/Left, Down)
    const midY = y1 + (y2 - y1) / 2;
    d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }

  const isConflict = edge.type === 'CONFLICTS_WITH';
  const color = isConflict ? '#ef4444' : 'rgba(107, 87, 68, 0.4)'; // subtle warm edge

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray={isConflict ? '4,4' : 'none'}
    />
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function KnowledgeGraphPage() {
  const [layoutedNodes, setLayoutedNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [focusMode, setFocusMode] = useState(false);
  const [focusedIds, setFocusedIds] = useState<Set<string> | null>(null);
  const [layoutDir, setLayoutDir] = useState<'TB' | 'LR'>('LR'); // Default LR for grid feel
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; vx: number; vy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setFocusedIds(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/graph?${params}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const rawNodes: any[] = (data.nodes || []).map((n: any) => ({
        id: n.id,
        label: n.label || n.name || n.title || 'Unknown',
        nodeType: n.type || 'KNOWLEDGE',
        subtitle: n.subtitle || n.role || n.department || '',
        risk: n.risk,
        summary: n.summary,
        bio: n.bio,
        description: n.description,
        coverage: n.coverage,
        concentrationRatio: n.concentrationRatio,
        x: 0, y: 0,
      }));

      const rawEdges: any[] = data.edges || [];

      setStats({ nodes: rawNodes.length, edges: rawEdges.length });

      if (rawNodes.length === 0) {
        setLayoutedNodes([]);
        setEdges([]);
        setLoading(false);
        return;
      }

      const laid = await layoutNodes(rawNodes, rawEdges, layoutDir);
      setLayoutedNodes(laid);
      setEdges(rawEdges);

      if (laid.length > 0) {
        const xs = laid.map((n) => n.x);
        const ys = laid.map((n) => n.y);
        const minX = Math.min(...xs) - 80;
        const minY = Math.min(...ys) - 80;
        const maxX = Math.max(...xs) + NODE_W + 80;
        const maxY = Math.max(...ys) + NODE_H + 80;
        setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
      }
    } catch (err: any) {
      console.error('Graph error:', err);
      setError(err.message || 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, layoutDir]);

  useEffect(() => { load(); }, [load]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (focusMode) {
      const connected = new Set<string>([node.id]);
      edges.forEach((e) => {
        if (e.source === node.id) connected.add(e.target);
        if (e.target === node.id) connected.add(e.source);
      });
      setFocusedIds(connected);
    } else {
      setFocusedIds(null);
    }
  }, [focusMode, edges]);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest('g[data-node]')) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, vx: viewBox.x, vy: viewBox.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = viewBox.w / rect.width;
    setViewBox((v) => ({
      ...v,
      x: dragStart.current!.vx - (e.clientX - dragStart.current!.mx) * scale,
      y: dragStart.current!.vy - (e.clientY - dragStart.current!.my) * scale,
    }));
  };
  const onMouseUp = () => setDragging(false);

  const zoom = (factor: number) => {
    setViewBox((v) => {
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      const nw = v.w * factor;
      const nh = v.h * factor;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 1.12 : 0.88);
  };

  const resetView = useCallback(() => {
    setSelectedNode(null);
    setFocusedIds(null);
    if (layoutedNodes.length > 0) {
      const xs = layoutedNodes.map((n) => n.x);
      const ys = layoutedNodes.map((n) => n.y);
      setViewBox({
        x: Math.min(...xs) - 80,
        y: Math.min(...ys) - 80,
        w: Math.max(...xs) + NODE_W + 160 - (Math.min(...xs) - 80),
        h: Math.max(...ys) + NODE_H + 160 - (Math.min(...ys) - 80),
      });
    }
  }, [layoutedNodes]);

  const TYPES = [
    { label: 'All', value: 'ALL' },
    { label: 'People', value: 'EMPLOYEE' },
    { label: 'Projects', value: 'PROJECT' },
    { label: 'Technology', value: 'TECHNOLOGY' },
    { label: 'Knowledge', value: 'KNOWLEDGE' },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 88px)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-8 h-8 rounded-xl bg-vault-surface border border-vault-border flex items-center justify-center shadow-card">
                <LayoutGrid size={16} className="text-vault-muted" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-vault-text">Topology Grid</h1>
            </div>
            <p className="text-[12px] text-vault-muted pl-10">
              Ordered flow visualization of system dependencies and knowledge lineage.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vault-surface border border-vault-border text-[11px] text-vault-muted shadow-card">
              <span className="font-bold text-vault-text">{stats.nodes}</span>nodes
              <span className="w-px h-3 bg-vault-border" />
              <span className="font-bold text-vault-text">{stats.edges}</span>links
            </div>

            <button onClick={() => setLayoutDir(d => d === 'TB' ? 'LR' : 'TB')}
              className="px-3 py-1.5 rounded-xl bg-vault-surface border border-vault-border text-[12px] font-semibold text-vault-muted hover:text-vault-text shadow-card">
              {layoutDir === 'TB' ? '↕ Flow Down' : '→ Flow Right'}
            </button>

            <button onClick={() => { setFocusMode(f => !f); setFocusedIds(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border shadow-card transition-all ${
                focusMode ? 'bg-[#1a1207] text-[#fdf8ef] border-[#1a1207]' : 'bg-vault-surface text-vault-muted border-vault-border hover:text-vault-text'
              }`}>
              <Focus size={13} /> {focusMode ? 'Focus ON' : 'Focus'}
            </button>

            <button onClick={resetView}
              className="p-1.5 rounded-xl bg-vault-surface border border-vault-border shadow-card text-vault-dim hover:text-vault-text">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 pb-1">
          {TYPES.map((t) => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-card transition-colors ${
                typeFilter === t.value ? 'bg-vault-text text-vault-dark' : 'bg-vault-surface border border-vault-border text-vault-muted hover:text-vault-text'
              }`}>
              {t.value !== 'ALL' && typeFilter === t.value && (
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: PALETTE[t.value]?.bg }} />
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="relative flex-1 rounded-[1.5rem] border border-vault-border bg-[#fdf8ef] overflow-hidden shadow-card"
          style={{ minHeight: 400 }}>
          
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#fdf8ef]/80 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full border-2 border-vault-dim/30 border-t-vault-dim animate-spin mb-3" />
            </div>
          )}

          {!loading && !error && layoutedNodes.length > 0 && (
            <svg
              ref={svgRef} width="100%" height="100%"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
              style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(160,137,110,0.15)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect x={viewBox.x - 2000} y={viewBox.y - 2000} width={viewBox.w + 4000} height={viewBox.h + 4000} fill="url(#grid)" />

              <g className="edges">
                {edges.map((e) => <EdgeLine key={e.id} edge={e} nodes={layoutedNodes} layoutDir={layoutDir} />)}
              </g>

              <g className="nodes">
                {layoutedNodes.map((node) => (
                  <g key={node.id} data-node={node.id}>
                    <KnowledgeNode
                      node={node}
                      selected={selectedNode?.id === node.id}
                      dimmed={focusedIds !== null && !focusedIds.has(node.id)}
                      onClick={handleNodeClick}
                    />
                  </g>
                ))}
              </g>
            </svg>
          )}

          {/* Legend Panel */}
          <div className="absolute bottom-4 left-4 bg-vault-surface/90 backdrop-blur-md border border-vault-border rounded-xl p-3 z-10 shadow-card flex flex-col gap-2 pointer-events-none">
            <h4 className="text-[10px] font-bold text-vault-dim uppercase tracking-wider mb-1">Node Types</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {Object.entries(PALETTE).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[3px] border" style={{ backgroundColor: colors.bg, borderColor: colors.border }} />
                  <span className="text-[10px] font-bold text-vault-muted capitalize">{type.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node detail panel */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-72 bg-vault-surface border border-vault-border rounded-2xl p-5 z-20 shadow-elevated text-vault-text">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest"
                  style={{ background: PALETTE[selectedNode.nodeType]?.bg, color: PALETTE[selectedNode.nodeType]?.text }}>
                  {selectedNode.nodeType}
                </span>
                <button onClick={() => { setSelectedNode(null); setFocusedIds(null); }} className="text-vault-dim hover:text-vault-text"><X size={14} /></button>
              </div>
              <h3 className="text-[15px] font-bold leading-snug mb-1">{selectedNode.label}</h3>
              {selectedNode.subtitle && <p className="text-[11px] text-vault-muted mb-4">{selectedNode.subtitle}</p>}
              
              <div className="space-y-3 pt-3 border-t border-vault-border/50">
                {selectedNode.risk && (
                  <div className="flex justify-between items-center text-[11px]"><span className="text-vault-muted">Risk Profile</span><RiskBadge risk={selectedNode.risk} /></div>
                )}
                {(selectedNode.summary || selectedNode.bio || selectedNode.description) && (
                  <p className="text-[11px] text-vault-dim leading-relaxed line-clamp-4">{selectedNode.summary || selectedNode.bio || selectedNode.description}</p>
                )}
              </div>
              
              <div className="pt-4 space-y-2">
                {selectedNode.nodeType === 'KNOWLEDGE' && (
                  <Link href={`/knowledge/${selectedNode.id}`} className="block w-full text-center py-2 rounded-xl bg-vault-text text-vault-dark text-[11px] font-bold hover:opacity-90">View Record</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
