import { motion } from "motion/react";
import {
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Check,
  Share2,
  BookmarkPlus,
} from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

export type MessageBlock =
  | { type: "text"; content: string }
  | { type: "code"; language: string; filename?: string; content: string };

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  blocks: MessageBlock[];
  time?: string;
  tokens?: number;
  fallbackUsed?: boolean;
  fallbackProvider?: string;
  providerUnavailable?: boolean;
}

export function Message({
  message,
  index,
}: {
  message: ChatMessage;
  index: number;
}) {
  const isUser = message.role === "user";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.04, 0.2),
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group/msg relative"
    >
      <div className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
        {isUser ? <UserAvatar /> : <AiAvatar />}

        <div
          className={`flex min-w-0 flex-1 flex-col gap-2 ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          {/* Header */}
          <div className="flex items-center flex-wrap gap-2 px-0.5">
            <span className="text-[12px] tracking-tight text-white/85">
              {isUser ? "You" : "Nebula"}
            </span>
            {!isUser && (
              <span className="rounded-full border border-violet-300/15 bg-violet-400/[0.06] px-1.5 py-px text-[9.5px] tracking-[0.18em] text-violet-200/80 uppercase">
                Opus 4.7
              </span>
            )}
            {!isUser && message.fallbackUsed && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-px text-[9.5px] text-amber-300 flex items-center gap-1 font-medium">
                ⚠️ Generated via {message.fallbackProvider || "Groq"} fallback
              </span>
            )}
            <span className="text-[11px] text-white/30">
              · {message.time ?? "just now"}
            </span>
          </div>

          {/* Bubble */}
          <div
            className={`relative max-w-[680px] rounded-[22px] px-5 py-4 text-[14.5px] leading-[1.7] ${
              isUser
                ? "border border-white/[0.08] bg-white/[0.04] text-white/95"
                : "text-white/85"
            }`}
            style={
              isUser
                ? undefined
                : {
                    // AI messages read as "page content", not a chat bubble — better long-form readability
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.018) 0%, rgba(255,255,255,0.008) 100%)",
                  }
            }
          >
            {!isUser && (
              <span className="pointer-events-none absolute top-2 bottom-2 -left-3 w-px rounded-full bg-gradient-to-b from-violet-400/40 via-sky-400/20 to-transparent" />
            )}
            {message.blocks.map((b, i) =>
              b.type === "text" ? (
                <RichText key={i} content={b.content} />
              ) : (
                <CodeBlock
                  key={i}
                  language={b.language}
                  filename={b.filename}
                  code={b.content}
                />
              ),
            )}
          </div>

          {/* Footer actions */}
          {!isUser ? (
            <div className="flex items-center gap-0.5 px-0.5 pt-0.5 opacity-60 transition duration-200 group-hover/msg:opacity-100">
              <CopyBtn text={getText(message)} />
              <ActionBtn icon={RefreshCw} label="Regenerate" />
              <ActionBtn icon={Share2} label="Share" />
              <ActionBtn icon={BookmarkPlus} label="Save" />
              <div className="mx-1 h-3.5 w-px bg-white/10" />
              <ActionBtn icon={ThumbsUp} />
              <ActionBtn icon={ThumbsDown} />
              {message.tokens && (
                <span className="ml-2 text-[10.5px] tracking-wider text-white/30">
                  {message.tokens} tokens
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-0.5 px-0.5 pt-0.5 opacity-0 transition duration-200 group-hover/msg:opacity-100">
              <CopyBtn text={getText(message)} />
              <ActionBtn icon={RefreshCw} label="Edit & resend" />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function getText(m: ChatMessage) {
  return m.blocks
    .map((b) => (b.type === "text" ? b.content : b.content))
    .join("\n\n");
}

function RichText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2.5">
      {lines.map((line, i) => {
        if (line.startsWith("## "))
          return (
            <h3
              key={i}
              className="mt-1 mb-0.5 text-[15.5px] tracking-tight text-white/95"
            >
              {line.slice(3)}
            </h3>
          );
        if (line.startsWith("- "))
          return (
            <div key={i} className="flex gap-3 pl-0.5">
              <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-gradient-to-r from-violet-300 to-sky-300" />
              <span
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: inline(line.slice(2)) }}
              />
            </div>
          );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: inline(line) }} />;
      })}
    </div>
  );
}

function inline(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[12.5px] text-violet-200">$1</code>',
    );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/45 transition hover:bg-white/[0.05] hover:text-white"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ActionBtn({ icon: Icon, label }: { icon: any; label?: string }) {
  return (
    <button
      title={label}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/45 transition hover:bg-white/[0.05] hover:text-white"
    >
      <Icon className="h-3 w-3" />
      {label && <span>{label}</span>}
    </button>
  );
}

function AiAvatar() {
  return (
    <div className="relative h-9 w-9 shrink-0">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 opacity-60 blur-md" />
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 ring-1 ring-white/20">
        <Sparkles className="h-4 w-4 text-[#0A0A0B]" strokeWidth={2.2} />
      </div>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-[11px] text-white/85">
      AK
    </div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full gap-4"
    >
      <div className="relative h-9 w-9 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 blur-md"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400">
          <Sparkles className="h-4 w-4 text-[#0A0A0B]" strokeWidth={2.2} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] tracking-tight text-white/85">Nebula</span>
          <span className="text-[11px] text-white/40">is thinking…</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-3.5 backdrop-blur-xl">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-violet-300 to-sky-300"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
