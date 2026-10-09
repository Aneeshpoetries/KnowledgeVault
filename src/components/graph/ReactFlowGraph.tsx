"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { GraphNode, nodeKind } from "@/lib/knowledge-map";

const nodeWidth = 240;
const nodeHeight = 54;

function getLayoutedElements(nodes: any[], edges: any[], direction = "LR") {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, nodesep: 25, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
}

function CustomNode({ data, selected }: NodeProps) {
  const { node } = data as { node: GraphNode };
  const kind = nodeKind(node);
  
  let color = "#3b82f6";
  if (kind === "EMPLOYEE") color = "#a66aff";
  else if (kind === "KNOWLEDGE") color = "#f0c75a";
  else if (kind === "DOCUMENTATION") color = "#b7f43a";
  else if (kind === "TECHNOLOGY") color = "#8fc6ff";
  else if (kind === "PROBLEM") color = "#f52aa8";
  else if (kind === "SOLUTION") color = "#10b981";
  else if (kind === "PROJECT") color = "#64748b";
  
  return (
    <div
      style={{
        width: nodeWidth,
        height: nodeHeight,
        background: "#1e1e2d",
        border: `1.5px solid ${selected ? "#ffffff" : "#2d2d44"}`,
        borderRadius: "8px",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 3px rgba(255,255,255,0.15)" : "0 4px 6px rgba(0,0,0,0.3)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#475569", border: "none", width: 6, height: 12, borderRadius: 2 }} />
      <div style={{ width: "6px", background: color, flexShrink: 0 }} />
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0, flex: 1 }}>
        <strong style={{ fontSize: "12px", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {node.label}
        </strong>
        {node.subtitle && (
          <small style={{ fontSize: "10px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
            {node.subtitle}
          </small>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#475569", border: "none", width: 6, height: 12, borderRadius: 2 }} />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export function ReactFlowGraph({
  nodes,
  edges,
  selectedId,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: any[];
  selectedId: string;
  onSelect: (node: GraphNode) => void;
}) {
  const [rfNodes, setNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!nodes.length) return;
    const validNodeIds = new Set(nodes.map((n) => n.id));
    const validEdges = edges
      .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#475569", strokeWidth: 1.5 },
      }));

    const initialNodes = nodes.map((n) => ({
      id: n.id,
      type: "custom",
      position: { x: 0, y: 0 },
      data: { node: n },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      validEdges,
      "LR"
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => setIsRendered(true), 50);
  }, [nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === selectedId }))
    );
  }, [selectedId, setNodes]);

  return (
    <div style={{ flex: 1, width: "100%", height: "100%", background: "#0b0f19", borderRadius: "8px", overflow: "hidden", opacity: isRendered ? 1 : 0, transition: "opacity 0.2s" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onSelect(node.data.node as GraphNode)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e293b" />
        <Controls
          style={{
            background: "#1e1e2d",
            border: "1px solid #334155",
            borderRadius: "6px",
            fill: "#cbd5e1",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
          }}
        />
        <MiniMap
          nodeColor={(n) => {
            const kind = nodeKind(n.data.node as GraphNode);
            if (kind === "EMPLOYEE") return "#a66aff";
            if (kind === "KNOWLEDGE") return "#f0c75a";
            if (kind === "DOCUMENTATION") return "#b7f43a";
            if (kind === "TECHNOLOGY") return "#8fc6ff";
            if (kind === "PROBLEM") return "#f52aa8";
            if (kind === "SOLUTION") return "#10b981";
            return "#64748b";
          }}
          style={{
            background: "#1e1e2d",
            border: "1px solid #334155",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
          }}
          maskColor="rgba(11, 15, 25, 0.75)"
        />
      </ReactFlow>
    </div>
  );
}
