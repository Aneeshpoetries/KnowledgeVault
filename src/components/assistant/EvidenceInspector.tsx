"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FileText,
  Network,
  X,
} from "@/components/ui/icons";
import type { ChatAnswerResponse, ChatMessageCitation } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

export function EvidenceInspector({
  citation,
  payload,
  onClose,
}: {
  citation: ChatMessageCitation | null;
  payload: ChatAnswerResponse | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!citation}
      onClose={onClose}
      label="Evidence inspector"
      className="kv-evidence-sheet"
    >
      {citation && (
        <>
          <header className="kv-evidence-sheet-head">
            <span>
              <FileText size={17} /> Evidence inspector
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close evidence inspector"
            >
              <X size={18} />
            </Button>
          </header>
          <div className="kv-evidence-sheet-body">
            <span className="kv-evidence-label">
              <Check size={14} /> Source attached
            </span>
            <h2>{citation.sourceName || citation.title}</h2>
            <p className="kv-evidence-type">
              {citation.sourceType || citation.type} ·{" "}
              {citation.projectName || "Organizational memory"}
            </p>
            <blockquote>{citation.excerpt}</blockquote>
            <dl>
              <div>
                <dt>Confidence</dt>
                <dd>
                  {Math.round(
                    citation.confidence * (citation.confidence <= 1 ? 100 : 1),
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Risk context</dt>
                <dd>{citation.risk}</dd>
              </div>
            </dl>
            {payload?.relatedKnowledge?.length ? (
              <section>
                <h3>Related knowledge</h3>
                {payload.relatedKnowledge.map((item) => (
                  <Link
                    key={item.id}
                    href={`/knowledge/${item.id}`}
                    onClick={onClose}
                  >
                    {item.title}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </section>
            ) : null}
            <Button asChild variant="outline">
              <Link
                href={`/graph?focus=${encodeURIComponent(citation.sourceName || citation.title)}`}
                onClick={onClose}
              >
                <Network size={16} /> Explore connections
              </Link>
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
