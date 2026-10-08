"use client";
import { useState } from "react";
import {
  FileText,
  Layers,
  Users,
  Brain,
  ArrowRight,
} from "@/components/ui/icons";
import { KnowledgeVaultLogo } from "@/components/ui/KnowledgeVaultLogo";

const sources = [
  {
    label: "Documents",
    icon: FileText,
    color: "#9a7549",
    title: "The procedure",
    detail:
      "A deployment runbook records the steps. Connect it to the system, dependencies, and owner it describes.",
  },
  {
    label: "Incident notes",
    icon: Layers,
    color: "#ad737e",
    title: "What happened last time",
    detail:
      "Incident #382 links queue backlog to payment timeouts. The sequence explains why a restart can duplicate requests.",
  },
  {
    label: "Interview transcripts",
    icon: Users,
    color: "#8764a2",
    title: "The reasoning behind the steps",
    detail:
      "Rahul explains why Redis should be checked before restarting the payment worker. Preserve the condition, not just the instruction.",
  },
  {
    label: "Manual knowledge",
    icon: Brain,
    color: "#6c7e9c",
    title: "The context worth keeping",
    detail:
      "Capture a procedure or decision directly, with its project, owner, and supporting evidence ready for review.",
  },
];
export function MemoryFlow() {
  const [selected, setSelected] = useState(2);
  return (
    <div className="kv-memory-flow">
      <div className="kv-flow-top">
        <span>FROM SCATTERED SOURCES</span>
        <span>TO SHARED CONTEXT</span>
      </div>
      <div className="kv-flow-diagram">
        <svg
          className="kv-flow-lines"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {sources.map((source, i) => (
              <marker
                key={source.label}
                id={`memory-arrow-${i}`}
                markerWidth="9"
                markerHeight="9"
                refX="7"
                refY="4.5"
                orient="auto"
              >
                <path
                  d="M1 1 L7 4.5 L1 8"
                  fill="none"
                  stroke={source.color}
                  strokeWidth="1.5"
                />
              </marker>
            ))}
          </defs>
          <ellipse
            cx="565"
            cy="200"
            rx="48"
            ry="178"
            fill="#eee8f333"
            stroke="#b6a7c244"
            strokeWidth="1.4"
          />
          <ellipse
            cx="579"
            cy="200"
            rx="48"
            ry="178"
            fill="none"
            stroke="#b6a7c233"
            strokeWidth="1.4"
          />
          {sources.map((source, i) => (
            <path
              key={source.label}
              d={`M340 ${62 + i * 92} H485 L746 ${164 + i * 24}`}
              fill="none"
              stroke={source.color}
              strokeWidth={selected === i ? 2 : 1.4}
              opacity={selected === i ? 1 : 0.42}
              markerEnd={`url(#memory-arrow-${i})`}
            />
          ))}
        </svg>
        <div className="kv-flow-sources">
          {sources.map(({ label, icon: Icon, color }, i) => (
            <button
              key={label}
              type="button"
              className={selected === i ? "is-selected" : ""}
              aria-pressed={selected === i}
              aria-controls="memory-source-context"
              onClick={() => setSelected(i)}
            >
              <span>{label}</span>
              <Icon size={27} strokeWidth={1.5} style={{ color }} />
            </button>
          ))}
        </div>
        <div className="kv-flow-destination">
          <KnowledgeVaultLogo size={52} />
          <strong>
            Organizational
            <br /> memory
          </strong>
          <span>Procedure · Owner · Project · Evidence</span>
        </div>
      </div>
      <div
        className="kv-flow-context"
        id="memory-source-context"
        aria-live="polite"
      >
        <span className="kv-flow-context-label">{sources[selected].label}</span>
        <div>
          <h3>{sources[selected].title}</h3>
          <p>{sources[selected].detail}</p>
        </div>
        <ArrowRight size={18} aria-hidden="true" />
      </div>
    </div>
  );
}
