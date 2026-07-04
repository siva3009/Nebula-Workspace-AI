import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "../hooks/useDebounce";
import {
  Search,
  MessageSquare,
  Sparkles,
  Library,
  LayoutDashboard,
  Settings,
  UserCircle2,
  Plus,
  ArrowRight,
  CornerDownLeft,
  Pin,
  Archive,
  Crown,
  Brain,
  Feather,
  Zap,
  Layers,
  Users,
  Code2,
  CalendarRange,
  Wand2,
  FileText,
  Sigma,
  Languages,
  Bug,
  Command as CommandIcon,
} from "lucide-react";
import type { ChatItem, View } from "./Sidebar";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  group: "Navigate" | "Models" | "Threads" | "Actions" | "AI Actions";
  badge?: string;
  run: () => void;
};

interface Props {
  open: boolean;
  onClose: () => void;
  chats: ChatItem[];
  onSelectChat: (id: string) => void;
  onView: (v: View) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenModel: () => void;
  onSelectModel: (id: string) => void;
  onOpenProfile: () => void;
}

const MODELS = [
  { id: "ollama-llama3", name: "Gemini 1.5 Flash", icon: Feather },
  { id: "deepseek-coder", name: "DeepSeek Coder V3 · Local", icon: Code2 },
  { id: "qwen-3-omni", name: "Gemini 1.5 Pro", icon: Wand2 },
  { id: "gemma-2", name: "Gemma 2 · Local", icon: Brain },
];

export function CommandPalette({
  open,
  onClose,
  chats,
  onSelectChat,
  onView,
  onNewChat,
  onOpenSettings,
  onOpenModel,
  onSelectModel,
  onOpenProfile,
}: Props) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const actions: Action[] = useMemo(() => {
    const base: Action[] = [
      {
        id: "new",
        label: "Start new conversation",
        hint: "⌘ N",
        icon: Plus,
        group: "Actions",
        run: onNewChat,
      },
      {
        id: "nav-chat",
        label: "Go to Conversations",
        icon: MessageSquare,
        group: "Navigate",
        run: () => onView("chat"),
      },
      {
        id: "nav-code",
        label: "Open Coding workspace",
        hint: "G C",
        icon: Code2,
        group: "Navigate",
        run: () => onView("code"),
      },
      {
        id: "nav-projects",
        label: "Open Projects hub",
        hint: "G P",
        icon: Layers,
        group: "Navigate",
        run: () => onView("projects"),
      },
      {
        id: "nav-planner",
        label: "Open Planner & tasks",
        hint: "G T",
        icon: CalendarRange,
        group: "Navigate",
        run: () => onView("planner"),
      },
      {
        id: "nav-team",
        label: "Open Team workspace",
        icon: Users,
        group: "Navigate",
        run: () => onView("team"),
      },
      {
        id: "nav-memory",
        label: "Open Memory & Knowledge",
        icon: Brain,
        group: "Navigate",
        run: () => onView("memory"),
      },
      {
        id: "nav-knowledge",
        label: "Go to Knowledge workspace",
        icon: Library,
        group: "Navigate",
        run: () => onView("knowledge"),
      },
      {
        id: "ai-summarize",
        label: "Summarize this conversation",
        hint: "with current model",
        badge: "AI",
        icon: FileText,
        group: "AI Actions",
        run: () => onNewChat(),
      },
      {
        id: "ai-plan",
        label: "Draft a plan from the open thread",
        badge: "AI",
        icon: Wand2,
        group: "AI Actions",
        run: () => onView("planner"),
      },
      {
        id: "ai-route",
        label: "Smart-route this prompt to best model",
        badge: "Auto",
        icon: Sparkles,
        group: "AI Actions",
        run: onOpenModel,
      },
      {
        id: "ai-explain",
        label: "Explain selected code",
        badge: "Code",
        icon: Code2,
        group: "AI Actions",
        run: () => onView("code"),
      },
      {
        id: "ai-debug",
        label: "Debug failing test in current file",
        badge: "Code",
        icon: Bug,
        group: "AI Actions",
        run: () => onView("code"),
      },
      {
        id: "ai-translate",
        label: "Translate response to…",
        badge: "AI",
        icon: Languages,
        group: "AI Actions",
        run: () => {},
      },
      {
        id: "ai-math",
        label: "Solve math problem step-by-step",
        badge: "Math",
        icon: Sigma,
        group: "AI Actions",
        run: () => {},
      },
      {
        id: "nav-admin",
        label: "Go to Mission Control",
        icon: LayoutDashboard,
        group: "Navigate",
        run: () => onView("admin"),
      },
      {
        id: "nav-profile",
        label: "Open profile & account",
        icon: UserCircle2,
        group: "Navigate",
        run: onOpenProfile,
      },
      {
        id: "settings",
        label: "Open settings",
        hint: "⌘ ,",
        icon: Settings,
        group: "Actions",
        run: onOpenSettings,
      },
      {
        id: "model-picker",
        label: "Browse all models…",
        icon: Sparkles,
        group: "Models",
        run: onOpenModel,
      },
      ...MODELS.map<Action>((m) => ({
        id: `model-${m.id}`,
        label: `Switch to ${m.name}`,
        icon: m.icon,
        group: "Models",
        run: () => onSelectModel(m.id),
      })),
      ...chats.slice(0, 12).map<Action>((c) => ({
        id: `chat-${c.id}`,
        label: c.title,
        hint: c.archived ? "Archived" : c.pinned ? "Pinned" : c.time,
        icon: c.pinned ? Pin : c.archived ? Archive : MessageSquare,
        group: "Threads",
        run: () => onSelectChat(c.id),
      })),
    ];
    if (!debouncedQ.trim()) return base;
    const t = debouncedQ.toLowerCase();
    return base.filter((a) => a.label.toLowerCase().includes(t));
  }, [debouncedQ, chats, onView, onNewChat, onOpenSettings, onOpenModel, onSelectModel, onSelectChat, onOpenProfile]);

  const grouped = useMemo(() => {
    const g: Record<string, Action[]> = {};
    actions.forEach((a) => {
      (g[a.group] ||= []).push(a);
    });
    return g;
  }, [actions]);

  const flat = actions;

  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(flat.length - 1, c + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const a = flat[cursor];
        if (a) {
          a.run();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, cursor, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-start bg-black/60 px-4 pt-[12vh] backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -10, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <span className="relative grid h-6 w-6 place-items-center">
                <span className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-500 to-sky-400 opacity-60 blur-md" />
                <span className="relative grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-sky-400">
                  <CommandIcon className="h-3 w-3 text-[#0A0A0B]" strokeWidth={2.4} />
                </span>
              </span>
              <Search className="h-4 w-4 text-white/45" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search threads, switch models, jump anywhere…"
                className="flex-1 bg-transparent text-[14.5px] text-white/95 outline-none placeholder:text-white/30"
              />
              <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/40">
                ESC
              </kbd>
            </div>

            <div className="relative max-h-[55vh] overflow-y-auto p-2">
              {flat.length === 0 ? (
                <div className="px-4 py-12 text-center text-[13px] text-white/40">
                  No results for "{q}"
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="px-3 pt-2 pb-1.5 text-[10px] tracking-[0.22em] text-white/30 uppercase">
                      {group}
                    </div>
                    {items.map((a) => {
                      const idx = flat.indexOf(a);
                      const active = idx === cursor;
                      return (
                        <button
                          key={a.id}
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => {
                            a.run();
                            onClose();
                          }}
                          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                            active
                              ? "bg-white/[0.06] text-white"
                              : "text-white/75 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className={`grid h-7 w-7 place-items-center rounded-md transition ${active ? "bg-gradient-to-br from-violet-500/30 to-sky-400/20 text-white" : "bg-white/[0.03] text-white/65"}`}>
                            <a.icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1 truncate text-[13px]">
                            {a.label}
                          </span>
                          {a.badge && (
                            <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-1.5 py-0.5 text-[9.5px] tracking-[0.16em] text-violet-100 uppercase">
                              {a.badge}
                            </span>
                          )}
                          {a.hint && (
                            <span className="text-[10.5px] tracking-wider text-white/35">
                              {a.hint}
                            </span>
                          )}
                          {active && (
                            <ArrowRight className="h-3.5 w-3.5 text-white/50" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="relative flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-4 py-2.5 text-[10.5px] text-white/40">
              <div className="flex items-center gap-4">
                <Hint k="↑↓" label="navigate" />
                <Hint k="↵" label="select" icon={CornerDownLeft} />
                <Hint k="ESC" label="close" />
              </div>
              <span className="tracking-wider">Nebula Command</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hint({ k, label, icon: Icon }: { k: string; label: string; icon?: any }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/50">
        {Icon ? <Icon className="h-2.5 w-2.5" /> : k}
      </kbd>
      {label}
    </span>
  );
}
