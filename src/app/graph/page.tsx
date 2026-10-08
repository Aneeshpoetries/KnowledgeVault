"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { offlineGraph } from "@/lib/offline-demo";
import {
  Search,
  ChevronRight,
  FolderGit2,
  Network,
  X,
  ArrowRight,
} from "@/components/ui/icons";
import { KnowledgeHierarchy } from "@/components/graph/KnowledgeHierarchy";
import {
  GraphNode,
  GraphData,
  projectContext,
  nodeKind,
} from "@/lib/knowledge-map";
import "./graph.css";

export default function GraphPage() {
  const { user } = useAuth();
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    (async () => {
      try {
        let result: GraphData;
        if (user.id.startsWith("demo-")) result = offlineGraph;
        else {
          const response = await fetch("/api/graph", {
            signal: controller.signal,
          });
          if (!response.ok)
            throw new Error(
              "Unable to load the knowledge map. Please try again.",
            );
          result = await response.json();
        }
        if (controller.signal.aborted) return;
        setData(result);
        const focusQuery = new URLSearchParams(window.location.search).get(
          "focus",
        );
        const focus = result.nodes.find(
          (n) =>
            n.id === focusQuery ||
            n.label.toLowerCase() === focusQuery?.toLowerCase(),
        )?.id;
        const projects = result.nodes.filter((n) => nodeKind(n) === "PROJECT");
        const project =
          projects.find(
            (p) =>
              focus && projectContext(result, p.id).some((n) => n.id === focus),
          ) || projects[0];
        setProjectId(project?.id || "");
        setSelectedId(
          focus && result.nodes.some((n) => n.id === focus)
            ? focus
            : project?.id || "",
        );
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the knowledge map.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user, retry]);
  const projects = data.nodes.filter((n) => nodeKind(n) === "PROJECT");
  const project = projects.find((n) => n.id === projectId);
  const context = useMemo(
    () => (projectId ? projectContext(data, projectId) : data.nodes),
    [data, projectId],
  );
  const selected = data.nodes.find((n) => n.id === selectedId);
  const connections = data.edges.flatMap((edge) => {
    if (edge.source !== selectedId && edge.target !== selectedId) return [];
    const node = data.nodes.find(
      (n) => n.id === (edge.source === selectedId ? edge.target : edge.source),
    );
    return node ? [{ edge, node, outgoing: edge.source === selectedId }] : [];
  });
  function inspect(node: GraphNode) {
    if (nodeKind(node) === "PROJECT") setProjectId(node.id);
    setSelectedId(node.id);
    if (window.innerWidth <= 760)
      requestAnimationFrame(() =>
        document
          .querySelector(".map-inspector")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
  }
  return (
    <AppShell>
      <div className="knowledge-map">
        <header className="map-heading">
          <div>
            <span className="map-eyebrow">ORGANIZATIONAL MEMORY</span>
            <h1>Knowledge map</h1>
            <p>
              Explore a project’s people, operational knowledge, and supporting
              evidence.
            </p>
          </div>
          <span className="map-total">
            <Network size={16} />
            {data.nodes.length} entities · {data.edges.length} connections
          </span>
        </header>
        <div className="map-toolbar">
          <label className="map-project">
            <FolderGit2 size={17} />
            <span className="sr-only">Project</span>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setSelectedId(e.target.value);
                setSearch("");
              }}
            >
              <option value="">All entities</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="map-search">
            <Search size={16} />
            <span className="sr-only">Search this project</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find people, knowledge, evidence…"
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </label>
        </div>
        {loading ? (
          <div className="map-empty" role="status">
            Loading your knowledge map…
          </div>
        ) : error ? (
          <div className="map-empty" role="alert">
            <p>{error}</p>
            <button
              className="map-action"
              onClick={() => setRetry((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className={`map-layout ${selected ? "has-selection" : ""}`}>
            <section className="map-tree-panel" aria-label="Project hierarchy">
              <div className="map-breadcrumb">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span>{project?.label || "All entities"}</span>
              </div>
              <KnowledgeHierarchy
                nodes={context}
                project={project}
                selectedId={selectedId}
                search={search}
                onSelect={inspect}
              />
              <p className="map-footnote">
                Grouped by role in the project. Select an entity to inspect its
                actual relationships.
              </p>
            </section>
            {selected && (
              <aside
                className="map-inspector"
                aria-label="Entity details"
                key={selected.id}
              >
                <div className="map-inspector-top">
                  <span className="map-eyebrow">
                    {nodeKind(selected).toLowerCase().replaceAll("_", " ")}
                  </span>
                  <button
                    aria-label="Close entity details"
                    onClick={() => setSelectedId("")}
                  >
                    <X size={17} />
                  </button>
                </div>
                <h2>{selected.label}</h2>
                <p className="map-subtitle">{selected.subtitle}</p>
                {(selected.summary || selected.description || selected.bio) && (
                  <p className="map-description">
                    {selected.summary || selected.description || selected.bio}
                  </p>
                )}
                <dl className="map-facts">
                  {selected.risk && (
                    <div>
                      <dt>Continuity risk</dt>
                      <dd>
                        <i
                          className={`record-dot signal-${selected.risk.toLowerCase()}`}
                        />
                        {selected.risk.toLowerCase()}
                      </dd>
                    </div>
                  )}
                  {selected.coverage != null && (
                    <div>
                      <dt>Coverage</dt>
                      <dd>{selected.coverage}%</dd>
                    </div>
                  )}
                  {selected.concentrationRatio != null && (
                    <div>
                      <dt>Knowledge concentration</dt>
                      <dd>{selected.concentrationRatio}%</dd>
                    </div>
                  )}
                </dl>
                <h3 className="map-connections-title">
                  Connections <span>{connections.length}</span>
                </h3>
                <div className="map-connections">
                  {connections.map(({ edge, node, outgoing }) => (
                    <button key={edge.id} onClick={() => inspect(node)}>
                      <span>
                        <small>
                          {outgoing ? "→ " : "← "}
                          {(edge.type || edge.label || "Related to")
                            .replaceAll("_", " ")
                            .toLowerCase()}
                        </small>
                        <strong>{node.label}</strong>
                      </span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                  {!connections.length && (
                    <p className="map-subtitle">No connections recorded yet.</p>
                  )}
                </div>
                {nodeKind(selected) === "KNOWLEDGE" && (
                  <Link
                    className="map-action"
                    href={`/knowledge/${selected.id === "demo-knowledge" ? "demo-failover" : selected.id}`}
                  >
                    Open knowledge record <ArrowRight size={15} />
                  </Link>
                )}
              </aside>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
