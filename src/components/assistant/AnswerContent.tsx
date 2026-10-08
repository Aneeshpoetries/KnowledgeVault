"use client";
import { useState, type ComponentProps } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export function CopyAction({
  text,
  label = "Copy answer",
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 2000);
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void copy()}
      aria-label={label}
      title={label}
    >
      {status === "copied" ? <Check size={15} /> : <Copy size={15} />}
      <span aria-live="polite">
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Copy unavailable"
            : label}
      </span>
    </Button>
  );
}
function CodeBlock({ children, ...props }: ComponentProps<"pre">) {
  const text =
    typeof children === "object" && children && "props" in children
      ? String((children.props as { children?: string }).children || "")
      : "";
  return (
    <div className="kv-code-block">
      <div>
        <span>Code</span>
        <CopyAction text={text} label="Copy code" />
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
export function AnswerContent({ text }: { text: string }) {
  return (
    <div className="kv-answer-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: CodeBlock,
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="kv-answer-table">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
