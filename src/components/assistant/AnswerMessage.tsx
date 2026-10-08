"use client";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "@/components/ui/icons";
import type { ChatAnswerResponse, ChatMessageCitation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnswerContent, CopyAction } from "./AnswerContent";
export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  payload?: ChatAnswerResponse;
  error?: boolean;
  query?: string;
};

export function AnswerMessage({
  message,
  busy,
  onRetry,
  onSource,
}: {
  message: Message;
  busy: boolean;
  onRetry: (query: string) => void;
  onSource: (source: ChatMessageCitation, payload: ChatAnswerResponse) => void;
}) {
  const payload = message.payload;
  return (
    <article className="kv-assistant-answer">
      <div className="kv-assistant-answer-mark">
        <Sparkles size={18} />
      </div>
      <div>
        <span className="kv-assistant-eyebrow">
          {message.error ? "Answer unavailable" : "KnowledgeVault"}
        </span>
        <AnswerContent text={message.text} />
        {payload?.why && (
          <details className="kv-assistant-why">
            <summary>Why this answer</summary>
            <p>{payload.why}</p>
          </details>
        )}
        {!!payload?.citations?.length && (
          <div className="kv-assistant-source-list">
            <span className="kv-assistant-eyebrow">
              Evidence · {payload.citations.length}{" "}
              {payload.citations.length === 1 ? "source" : "sources"}
            </span>
            <div>
              {payload.citations.map((source, index) => (
                <button
                  key={`${source.id}-${index}`}
                  onClick={() => onSource(source, payload)}
                >
                  <FileText size={15} />
                  <span>{source.sourceName || source.title}</span>
                  <small>{index + 1}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {payload?.knowledgeGapDetected && (
          <div className="kv-assistant-gap">
            <ShieldAlert size={18} />
            <div>
              <strong>Knowledge needs capture</strong>
              <p>
                {payload.gapDetails?.description ||
                  "There is not enough verified evidence to answer with confidence."}
              </p>
              <Link href="/gaps">
                Review gaps <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
        {payload?.isSufficientEvidence && (
          <div className="kv-assistant-answer-meta">
            <ShieldCheck size={15} />
            {Math.round(
              payload.confidence * (payload.confidence <= 1 ? 100 : 1),
            )}
            % confidence <span>·</span> Check the source before acting
          </div>
        )}
        <div className="kv-answer-actions">
          {!message.error && <CopyAction text={message.text} />}
          {message.query && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onRetry(message.query!)}
            >
              <RotateCcw size={15} />
              {message.error ? "Retry" : "Ask again"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
