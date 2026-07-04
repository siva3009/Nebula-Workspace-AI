import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toggle } from "./ui/Toggle";
import {
  Brain,
  ChevronDown,
  File as FileIcon,
  Layers,
  Sparkles,
  Eye,
  Plus,
  X,
  Lightbulb,
  Database,
  ScanLine,
} from "lucide-react";

export type ContextSource = {
  id: string;
  label: string;
  kind: "file" | "project" | "memory" | "thread";
  meta?: string;
  enabled: boolean;
};

import { DEFAULT_SOURCES as _DEFAULT_SOURCES, REASONING as _REASONING } from "../mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const DEFAULT_SOURCES = isDemoMode ? _DEFAULT_SOURCES : [];
const REASONING = isDemoMode ? _REASONING : [];

export function ContextRail({
  modelName = "Nebula",
}: {
  modelName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<ContextSource[]>(DEFAULT_SOURCES);
  const [showReasoning, setShowReasoning] = useState(false);

  const enabled = sources.filter((s) => s.enabled);
  const usedPct = Math.min(0.22 + enabled.length * 0.09, 0.92);

  const toggle = (id: string) =>
    setSources((xs) => xs.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/80 backdrop-blur-xl">
        {/* Strip */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-3.5 py-2 text-left transition hover:bg-white/[0.02]"
        >
          <span className="relative grid h-6 w-6 shrink-0 place-items-center">
            <span className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-500 to-sky-400 opacity-60 blur-md" />
            <span className="relative grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-sky-400">
              <Brain className="h-3 w-3 text-[#0A0A0B]" strokeWidth={2.4} />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-white/85">{modelName} is using</span>
              <span className="flex flex-wrap items-center gap-1.5">
                {enabled.slice(0, 3).map((s) => (
                  <Chip key={s.id} kind={s.kind} label={s.label} compact />
                ))}
                {enabled.length > 3 && (
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-white/55">
                    +{enabled.length - 3}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10.5px] text-white/40">
              <span className="tracking-[0.18em] uppercase">Context</span>
              <span className="relative h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.span
                  initial={false}
                  animate={{ width: `${usedPct * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 to-sky-400"
                />
              </span>
              <span className="tabular-nums">{Math.round(usedPct * 100)}% of window</span>
              <span className="text-white/20">·</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReasoning((v) => !v);
                }}
                className="flex cursor-pointer items-center gap-1 text-white/55 transition hover:text-white"
              >
                <Eye className="h-3 w-3" />
                Reasoning
              </span>
            </div>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/40"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        {/* Expanded panel */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/[0.05]"
            >
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Sources in scope</span>
                    <button className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10.5px] text-white/65 transition hover:bg-white/[0.06] hover:text-white">
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {sources.map((s) => (
                      <li
                        key={s.id}
                        className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition ${
                          s.enabled
                            ? "border-white/[0.08] bg-white/[0.03]"
                            : "border-white/[0.04] bg-transparent opacity-55"
                        }`}
                      >
                        <Chip kind={s.kind} label="" iconOnly />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] text-white/85">{s.label}</div>
                          {s.meta && (
                            <div className="truncate text-[10.5px] text-white/40">{s.meta}</div>
                          )}
                        </div>
                        <Toggle
                          size="sm"
                          checked={s.enabled}
                          onChange={() => toggle(s.id)}
                          label={`Toggle ${s.label}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Workspace intelligence</span>
                    <span className="text-[10.5px] text-emerald-300/80">live</span>
                  </div>
                  <div className="space-y-2">
                    <IntelRow icon={Database} title="Memory online" detail="142 facts across 5 projects" />
                    <IntelRow icon={ScanLine} title="Files indexed" detail="38 of 38 · embeddings fresh" />
                    <IntelRow icon={Layers} title="Knowledge graph" detail="184 entities · updated 3 min ago" />
                    <IntelRow icon={Lightbulb} title="Suggested context" detail="checkout-spec-v3.pdf seems relevant" action="Add" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reasoning peek */}
        <AnimatePresence initial={false}>
          {showReasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-white/[0.05] bg-gradient-to-br from-violet-500/[0.04] to-transparent"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 text-violet-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] tracking-[0.18em] text-white/45 uppercase">How Nebula is thinking</div>
                  <ul className="mt-1.5 space-y-1.5">
                    {REASONING.map((r) => (
                      <li key={r.label} className="flex items-baseline gap-2 text-[12px] text-white/75">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-violet-300" />
                        <span className="text-white/90">{r.label}</span>
                        <span className="text-white/40">— {r.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setShowReasoning(false)}
                  className="rounded-md p-1 text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({
  kind,
  label,
  compact,
  iconOnly,
}: {
  kind: ContextSource["kind"];
  label: string;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const map = {
    file: { Icon: FileIcon, tone: "from-sky-400 to-cyan-300" },
    project: { Icon: Layers, tone: "from-violet-500 to-fuchsia-400" },
    memory: { Icon: Brain, tone: "from-emerald-400 to-cyan-300" },
    thread: { Icon: Sparkles, tone: "from-amber-300 to-rose-400" },
  } as const;
  const { Icon, tone } = map[kind];

  if (iconOnly) {
    return (
      <span className={`grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br ${tone}`}>
        <Icon className="h-3 w-3 text-[#0A0A0B]" strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <span
      className={`flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] py-0.5 text-white/70 ${compact ? "max-w-[160px] pr-2 pl-1 text-[10.5px]" : "max-w-[200px] pr-2.5 pl-1.5 text-[11px]"}`}
    >
      <span className={`grid h-3.5 w-3.5 place-items-center rounded-sm bg-gradient-to-br ${tone}`}>
        <Icon className="h-2 w-2 text-[#0A0A0B]" strokeWidth={2.4} />
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function IntelRow({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof Database;
  title: string;
  detail: string;
  action?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
      <span className="grid h-7 w-7 place-items-center rounded-md border border-white/[0.06] bg-white/[0.03]">
        <Icon className="h-3.5 w-3.5 text-white/70" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-white/85">{title}</div>
        <div className="truncate text-[10.5px] text-white/45">{detail}</div>
      </div>
      {action && (
        <button className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] text-white/75 transition hover:bg-white/[0.08] hover:text-white">
          {action}
        </button>
      )}
    </div>
  );
}
