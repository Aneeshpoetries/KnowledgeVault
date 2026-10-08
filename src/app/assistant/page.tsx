"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  BookOpen,
  ClockCounterClockwise,
  GitBranch,
  Plus,
  ShieldCheck,
  Sparkle,
  X,
} from "@/components/ui/icons";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import {
  AnswerMessage,
  type Message,
} from "@/components/assistant/AnswerMessage";
import { EvidenceInspector } from "@/components/assistant/EvidenceInspector";
import type { ChatAnswerResponse, ChatMessageCitation } from "@/lib/types";
import { assistantPrompts } from "@/lib/assistant-prompts";
import { demoAnswer } from "@/lib/demo-store";
import { useAuth } from "@/context/AuthContext";
import "./assistant.css";

type Conversation = { id: string; title: string; messages: Message[] };
const promptIcons = [ShieldCheck, GitBranch, ClockCounterClockwise, BookOpen];

export default function AssistantPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [citation, setCitation] = useState<ChatMessageCitation | null>(null);
  const [activePayload, setActivePayload] = useState<ChatAnswerResponse | null>(
    null,
  );
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sending = useRef(false);
  const initialQuery = useRef(false);
  const identity = useRef(user?.id);

  // Conversation text stays in memory and is cleared when the signed-in identity changes.
  useEffect(() => {
    if (identity.current !== user?.id) {
      setMessages([]);
      setConversations([]);
      setActiveId("");
      setCitation(null);
      identity.current = user?.id;
    }
  }, [user?.id]);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
    });
  }, [messages, loading]);
  useEffect(() => {
    if (!user || initialQuery.current) return;
    initialQuery.current = true;
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) void send(query);
  });

  function saveConversation(next: Message[], id: string) {
    setMessages(next);
    setConversations((current) => {
      const entry = {
        id,
        title:
          next.find((message) => message.role === "user")?.text ||
          "New conversation",
        messages: next,
      };
      return [entry, ...current.filter((item) => item.id !== id)];
    });
  }

  async function send(value = input) {
    const query = value.trim();
    if (!query || sending.current || !user) return;
    sending.current = true;
    const id = activeId || crypto.randomUUID();
    setActiveId(id);
    const next: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", text: query },
    ];
    saveConversation(next, id);
    setInput("");
    setLoading(true);
    try {
      let payload: ChatAnswerResponse;
      if (user.id.startsWith("demo-")) payload = demoAnswer(query);
      else {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (!response.ok) throw new Error("Answer unavailable");
        payload = await response.json();
        if (
          typeof payload.answer !== "string" ||
          !Array.isArray(payload.citations)
        )
          throw new Error("Invalid answer");
      }
      if (identity.current === user.id)
        saveConversation(
          [
            ...next,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: payload.answer,
              payload,
              query,
            },
          ],
          id,
        );
    } catch {
      if (identity.current === user.id)
        saveConversation(
          [
            ...next,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: "The knowledge service could not be reached. Your question is still here. Try again when the connection is restored.",
              error: true,
              query,
            },
          ],
          id,
        );
    } finally {
      sending.current = false;
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function newConversation() {
    if (sending.current) return;
    setMessages([]);
    setActiveId("");
    setInput("");
    setCitation(null);
    inputRef.current?.focus();
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  return (
    <AppShell>
      <div className="kv-assistant">
        <header className="kv-assistant-top">
          <div>
            <span className="kv-assistant-eyebrow">
              Workspace / Continuity AI
            </span>
            <h1>Ask organizational memory</h1>
            <p>Answers with the context and evidence behind them.</p>
          </div>
          <div className="kv-assistant-toolbar">
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => setHistoryOpen(true)}
            >
              <ClockCounterClockwise size={17} />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !messages.length}
              onClick={newConversation}
            >
              <Plus size={17} />
              New conversation
            </Button>
          </div>
        </header>
        <section
          className="kv-assistant-main"
          aria-label="Conversation"
          aria-busy={loading}
        >
          <div className="kv-assistant-context">
            <span>
              <ShieldCheck size={16} />
              {user?.id.startsWith("demo-")
                ? "Demo workspace · saved evidence"
                : "Your accessible workspace knowledge"}
            </span>
            <span>Sources included with answers</span>
          </div>
          {messages.length === 0 ? (
            <div className="kv-assistant-welcome">
              <div className="kv-assistant-orb">
                <Sparkle size={25} />
              </div>
              <span className="kv-assistant-eyebrow">
                Context that stays with your team
              </span>
              <h2>What do you need to know?</h2>
              <p>
                Find a recovery step, understand a decision, or see what still
                needs documenting. Start with a question from your work.
              </p>
              <div className="kv-assistant-prompts">
                {assistantPrompts.map((prompt, index) => {
                  const Icon = promptIcons[index];
                  return (
                    <button
                      key={prompt.query}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(prompt.query)}
                    >
                      <Icon size={19} />
                      <span>
                        <strong>{prompt.label}</strong>
                        <small>{prompt.detail}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className="kv-assistant-messages"
              role="log"
              aria-label="Conversation messages"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((message) =>
                message.role === "user" ? (
                  <div className="kv-assistant-user" key={message.id}>
                    <span className="sr-only">You: </span>
                    {message.text}
                  </div>
                ) : (
                  <AnswerMessage
                    key={message.id}
                    message={message}
                    busy={loading}
                    onRetry={(query) => void send(query)}
                    onSource={(source, payload) => {
                      setCitation(source);
                      setActivePayload(payload);
                    }}
                  />
                ),
              )}
              {loading && (
                <div className="kv-assistant-thinking" role="status">
                  <Sparkle size={18} />
                  <span>
                    Finding relevant evidence
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
          <div className="kv-assistant-composer-wrap">
            <form className="kv-assistant-composer" onSubmit={submit}>
              <textarea
                ref={inputRef}
                rows={2}
                maxLength={6000}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about a system, procedure, or decision…"
                aria-label="Ask organizational memory"
              />
              <div className="kv-assistant-composer-footer">
                <span>
                  <ShieldCheck size={15} />
                  {user?.id.startsWith("demo-")
                    ? "Saved demo answers · instant retrieval"
                    : "Grounded in accessible knowledge"}
                </span>
                <Button
                  type="submit"
                  disabled={!input.trim() || loading}
                  size="icon"
                  aria-label="Send question"
                >
                  <ArrowUp size={18} />
                </Button>
              </div>
            </form>
            <p>
              Verify critical procedures with their owner.{" "}
              <span>Enter to send · Shift + Enter for a new line</span>
            </p>
          </div>
        </section>
        <EvidenceInspector
          citation={citation}
          payload={activePayload}
          onClose={() => setCitation(null)}
        />
        <Modal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          label="Conversation history"
          className="kv-history-dialog"
        >
          <header>
            <div>
              <h2>Conversations</h2>
              <p>Available during this session.</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHistoryOpen(false)}
              aria-label="Close conversation history"
            >
              <X size={18} />
            </Button>
          </header>
          <div>
            {conversations.length ? (
              conversations.map((item) => (
                <button
                  key={item.id}
                  aria-current={item.id === activeId ? "true" : undefined}
                  onClick={() => {
                    setMessages(item.messages);
                    setActiveId(item.id);
                    setCitation(null);
                    setHistoryOpen(false);
                  }}
                >
                  <ClockCounterClockwise size={17} />
                  <span>{item.title}</span>
                  <small>
                    {
                      item.messages.filter((message) => message.role === "user")
                        .length
                    }{" "}
                    questions
                  </small>
                </button>
              ))
            ) : (
              <p className="kv-history-empty">
                Your conversations will appear here after your first question.
              </p>
            )}
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
