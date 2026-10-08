"use client";
import { useState } from "react";
import {
  ChevronRight,
  Users,
  Brain,
  BookOpen,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  FolderGit2,
} from "@/components/ui/icons";
import { GraphNode, nodeKind } from "@/lib/knowledge-map";
const groups = [
  { type: "EMPLOYEE", label: "People & ownership", icon: Users },
  { type: "KNOWLEDGE", label: "Operational knowledge", icon: Brain },
  { type: "DOCUMENTATION", label: "Documentation & evidence", icon: BookOpen },
  { type: "TECHNOLOGY", label: "Technology", icon: Cpu },
  { type: "PROBLEM", label: "Known problems", icon: AlertTriangle },
  { type: "SOLUTION", label: "Recovery & solutions", icon: CheckCircle2 },
  { type: "PROJECT", label: "Projects", icon: FolderGit2 },
];
export function KnowledgeHierarchy({
  nodes,
  project,
  selectedId,
  search,
  onSelect,
}: {
  nodes: GraphNode[];
  project?: GraphNode;
  selectedId: string;
  search: string;
  onSelect: (node: GraphNode) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const query = search.trim().toLowerCase();
  const visible = nodes.filter(
    (n) =>
      n.id !== project?.id &&
      (!query ||
        `${n.label} ${n.subtitle || ""} ${nodeKind(n)}`
          .toLowerCase()
          .includes(query)),
  );
  const allCollapsed = groups.every((g) => collapsed.has(g.type));
  return (
    <>
      <div className="map-root-line">
        <button
          className={`map-root ${selectedId === project?.id ? "is-selected" : ""}`}
          disabled={!project}
          onClick={() => project && onSelect(project)}
        >
          <FolderGit2 size={19} />
          <span>
            <strong>{project?.label || "Workspace knowledge"}</strong>
            <small>
              {project?.subtitle || `${nodes.length} connected entities`}
            </small>
          </span>
        </button>
        <button
          className="map-text-button"
          disabled={!!query}
          onClick={() =>
            setCollapsed(
              allCollapsed
                ? new Set()
                : new Set([...groups.map((g) => g.type), "OTHER"]),
            )
          }
        >
          {allCollapsed ? "Expand all" : "Collapse all"}
        </button>
      </div>
      <ul className="map-branches">
        {[
          ...groups,
          { type: "OTHER", label: "Other entities", icon: Brain },
        ].map((group) => {
          const items = visible.filter((n) =>
            group.type === "OTHER"
              ? !groups.some((g) => g.type === nodeKind(n))
              : nodeKind(n) === group.type,
          );
          if (!items.length) return null;
          const open = !!query || !collapsed.has(group.type);
          const Icon = group.icon;
          return (
            <li key={group.type} className="map-branch">
              <button
                className="map-group"
                aria-expanded={open}
                onClick={() =>
                  setCollapsed((previous) => {
                    const next = new Set(previous);
                    if (next.has(group.type)) next.delete(group.type);
                    else next.add(group.type);
                    return next;
                  })
                }
              >
                <ChevronRight size={14} className={open ? "is-open" : ""} />
                <Icon size={17} />
                <span>{group.label}</span>
                <small>{items.length}</small>
              </button>
              {open && (
                <ul className="map-leaves">
                  {items.map((node) => (
                    <li key={node.id}>
                      <button
                        className={`map-leaf ${selectedId === node.id ? "is-selected" : ""}`}
                        onClick={() => onSelect(node)}
                        aria-pressed={selectedId === node.id}
                      >
                        <span className="map-leaf-copy">
                          <strong>{node.label}</strong>
                          {node.subtitle && <small>{node.subtitle}</small>}
                        </span>
                        {node.risk && (
                          <span className="map-node-risk">
                            <i
                              className={`record-dot signal-${node.risk.toLowerCase()}`}
                            />
                            <span>{node.risk.toLowerCase()}</span>
                          </span>
                        )}
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      {!visible.length && (
        <div className="map-empty">
          {query
            ? `No entities match “${search}”. Try another name or type.`
            : "No project knowledge has been connected yet."}
        </div>
      )}
    </>
  );
}
