export interface GraphNode {
  id: string;
  label: string;
  nodeType?: string;
  type?: string;
  subtitle?: string;
  risk?: string;
  summary?: string;
  description?: string;
  bio?: string;
  coverage?: number;
  concentrationRatio?: number;
}
export interface GraphData {
  nodes: GraphNode[];
  edges: {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
  }[];
}
export const nodeKind = (node: GraphNode) =>
  node.nodeType || node.type || "KNOWLEDGE";
// Follow project dependencies without traversing a shared owner into another project.
export function projectContext(
  data: GraphData,
  projectId: string,
): GraphNode[] {
  const ids = new Set([projectId]);
  const owners = new Set<string>();
  for (const edge of data.edges) {
    const neighbor =
      edge.source === projectId
        ? edge.target
        : edge.target === projectId
          ? edge.source
          : null;
    if (
      neighbor &&
      data.nodes.some((n) => n.id === neighbor && nodeKind(n) === "EMPLOYEE")
    )
      owners.add(neighbor);
  }
  owners.forEach((id) => ids.add(id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of data.edges) {
      if (!ids.has(edge.source) || ids.has(edge.target)) continue;
      const target = data.nodes.find((n) => n.id === edge.target);
      if (
        !target ||
        nodeKind(target) === "PROJECT" ||
        nodeKind(target) === "EMPLOYEE"
      )
        continue;
      if (owners.has(edge.source)) {
        if (nodeKind(target) !== "KNOWLEDGE") continue;
        if (
          data.edges.some(
            (e) =>
              e.target === target.id &&
              e.source !== projectId &&
              data.nodes.some(
                (n) => n.id === e.source && nodeKind(n) === "PROJECT",
              ),
          )
        )
          continue;
      }
      ids.add(target.id);
      changed = true;
    }
  }
  for (const edge of data.edges)
    if (
      ids.has(edge.target) &&
      data.nodes.some(
        (n) => n.id === edge.source && nodeKind(n) === "DOCUMENTATION",
      )
    )
      ids.add(edge.source);
  return data.nodes.filter((n) => ids.has(n.id));
}
