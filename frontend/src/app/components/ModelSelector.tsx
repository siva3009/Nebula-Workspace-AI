import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  HardDrive,
  Cloud,
  Lock,
  Zap,
  Cpu,
  Sparkles,
  Code2,
  Brain,
  Feather,
  Wand2,
  Gauge,
} from "lucide-react";

type Speed = "instant" | "fast" | "balanced" | "deep";
type Capability = "Code" | "Reasoning" | "Fast" | "Vision" | "Math" | "Multilingual";

type AvailableModel = {
  id: string;
  name: string;
  provider: "Google" | "DeepSeek" | "Qwen" | "Gemma" | "Ollama";
  desc: string;
  icon: any;
  accent: string;
  badge: string; // e.g. "Llama 3.1 · 8B"
  size: string; // disk footprint
  speed: Speed;
  capabilities: Capability[];
  recommended?: boolean;
};

type ComingSoonModel = {
  id: string;
  name: string;
  provider: "Anthropic" | "OpenAI" | "Google";
  blurb: string;
  icon: any;
  accent: string;
  eta?: string;
};

const AVAILABLE: AvailableModel[] = [
  {
    id: "ollama-llama3",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    desc: "Recommended default model. Balanced speed, reasoning, and multimodal capabilities.",
    icon: HardDrive,
    accent: "from-emerald-400 to-cyan-300",
    badge: "Flash · Cloud",
    size: "API",
    speed: "fast",
    capabilities: ["Fast", "Reasoning", "Multilingual"],
    recommended: true,
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder V3",
    provider: "DeepSeek",
    desc: "Local coding specialist. Strong at refactors, debugging, and multi-file edits.",
    icon: Code2,
    accent: "from-violet-500 to-fuchsia-400",
    badge: "16B · Local",
    size: "9.1 GB",
    speed: "balanced",
    capabilities: ["Code", "Reasoning"],
  },
  {
    id: "qwen-3-omni",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    desc: "Deep reasoning, complex coding tasks, and large context windows.",
    icon: Wand2,
    accent: "from-sky-400 to-cyan-300",
    badge: "Pro · Cloud",
    size: "API",
    speed: "fast",
    capabilities: ["Multilingual", "Fast", "Reasoning"],
  },
  {
    id: "gemma-2",
    name: "Gemma 2",
    provider: "Gemma",
    desc: "Compact and quick. Great for drafts, lookups, and lightweight chat.",
    icon: Feather,
    accent: "from-amber-300 to-rose-400",
    badge: "9B · Local",
    size: "5.4 GB",
    speed: "instant",
    capabilities: ["Fast"],
  },
];

const COMING_SOON: ComingSoonModel[] = [
  {
    id: "claude-opus",
    name: "Claude",
    provider: "Anthropic",
    blurb: "Premium reasoning, long context, agentic workflows.",
    icon: Brain,
    accent: "from-amber-300 to-orange-400",
    eta: "Soon",
  },
  {
    id: "openai-gpt",
    name: "OpenAI",
    provider: "OpenAI",
    blurb: "GPT family with vision, voice, and tool use.",
    icon: Sparkles,
    accent: "from-emerald-300 to-teal-400",
    eta: "Soon",
  },
  {
    id: "google-gemini",
    name: "Gemini",
    provider: "Google",
    blurb: "Multimodal Google model with massive context.",
    icon: Cpu,
    accent: "from-sky-400 to-indigo-400",
    eta: "Soon",
  },
];

// Backwards-compatible export used elsewhere in the app for name lookup.
export const MODELS = AVAILABLE.map((m) => ({
  id: m.id,
  name: m.name,
  desc: m.desc,
  badge: m.badge,
  icon: m.icon,
  accent: m.accent,
}));

interface Props {
  open: boolean;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function ModelSelector({ open, selected, onSelect, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-6 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[80px]" />

            {/* Header */}
            <div className="relative flex items-start justify-between border-b border-white/[0.06] px-7 pt-6 pb-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  <HardDrive className="h-3 w-3" />
                  Local-first intelligence
                </div>
                <h2
                  className="mt-1 text-white/95 tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30 }}
                >
                  Choose your model
                </h2>
                <p className="mt-1.5 max-w-lg text-[13px] text-white/50">
                  Nebula currently runs locally using private on-device AI. Cloud providers will be added later.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="relative max-h-[68vh] overflow-y-auto px-5 py-5">
              {/* Local AI group */}
              <GroupHeader
                icon={HardDrive}
                label="Local AI"
                hint="Available now"
                tone="live"
              />
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AVAILABLE.map((m) => (
                  <AvailableCard
                    key={m.id}
                    model={m}
                    active={selected === m.id}
                    onSelect={() => {
                      onSelect(m.id);
                      onClose();
                    }}
                  />
                ))}
              </div>

              {/* Cloud AI group */}
              <div className="mt-7">
                <GroupHeader
                  icon={Cloud}
                  label="Cloud AI"
                  hint="Coming soon"
                  tone="soon"
                />
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {COMING_SOON.map((m) => (
                    <SoonCard key={m.id} model={m} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-7 py-3.5">
              <div className="flex items-center gap-2 text-[11px] text-white/45">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-400/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                Running on-device · zero data leaves your machine
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-white px-4 py-1.5 text-[12px] text-[#0A0A0B] transition hover:bg-white/90"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────── Pieces ────────── */

function GroupHeader({
  icon: Icon,
  label,
  hint,
  tone,
}: {
  icon: any;
  label: string;
  hint: string;
  tone: "live" | "soon";
}) {
  const tones =
    tone === "live"
      ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200"
      : "border-white/10 bg-white/[0.04] text-white/55";
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-[10.5px] tracking-[0.3em] text-white/45 uppercase">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <span className={`rounded-full border px-2 py-0.5 text-[10px] tracking-[0.18em] uppercase ${tones}`}>
        {hint}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
    </div>
  );
}

function AvailableCard({
  model,
  active,
  onSelect,
}: {
  model: AvailableModel;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = model.icon;
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none ${
        active
          ? "border-white/25 bg-white/[0.05] shadow-[0_0_0_1px_rgba(139,92,246,0.25)_inset,0_18px_40px_-22px_rgba(139,92,246,0.6)]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      <div
        className={`absolute -top-14 -right-14 h-32 w-32 rounded-full bg-gradient-to-br ${model.accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${model.accent} text-[#0A0A0B]`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-white/95">{model.name}</span>
              {model.recommended && (
                <span className="rounded-full border border-violet-400/30 bg-violet-400/[0.08] px-1.5 py-0.5 text-[9.5px] tracking-[0.18em] text-violet-100 uppercase">
                  Recommended
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] tracking-[0.16em] text-white/40 uppercase">
              <span>{model.provider}</span>
              <span className="text-white/15">·</span>
              <span className="rounded-sm border border-white/[0.07] bg-white/[0.03] px-1 py-px tracking-[0.14em] text-white/55">
                {model.badge}
              </span>
            </div>
          </div>
        </div>
        {active ? (
          <div className="grid h-5 w-5 place-items-center rounded-full bg-white text-[#0A0A0B]">
            <Check className="h-3 w-3" strokeWidth={3} />
          </div>
        ) : (
          <LocalDot />
        )}
      </div>

      <p className="relative mt-3 text-[12.5px] leading-relaxed text-white/55">
        {model.desc}
      </p>

      <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
        {model.capabilities.map((c) => (
          <CapPill key={c} cap={c} />
        ))}
      </div>

      <div className="relative mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[10.5px] text-white/45">
        <SpeedMeter speed={model.speed} />
        <span className="tabular-nums">{model.size}</span>
      </div>
    </button>
  );
}

function SoonCard({ model }: { model: ComingSoonModel }) {
  const Icon = model.icon;
  return (
    <div
      aria-disabled
      tabIndex={-1}
      className="group relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 text-left opacity-80"
    >
      {/* Glass mask */}
      <div
        className={`pointer-events-none absolute -top-14 -right-14 h-28 w-28 rounded-full bg-gradient-to-br ${model.accent} opacity-[0.08] blur-2xl`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#0A0A0B]/30 backdrop-blur-[1px]" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${model.accent} text-[#0A0A0B] opacity-60 grayscale`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-white/75">{model.name}</span>
            </div>
            <div className="mt-0.5 text-[10.5px] tracking-[0.16em] text-white/35 uppercase">
              {model.provider}
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9.5px] tracking-[0.18em] text-white/55 uppercase">
          <Lock className="h-2.5 w-2.5" />
          {model.eta ?? "Soon"}
        </span>
      </div>

      <p className="relative mt-3 text-[11.5px] leading-relaxed text-white/40">
        {model.blurb}
      </p>

      <div className="relative mt-3 flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-white/35 uppercase">
        <span className="h-1 w-1 rounded-full bg-white/30" />
        Cloud provider
      </div>
    </div>
  );
}

function LocalDot() {
  return (
    <span
      title="Runs on-device"
      className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[9.5px] tracking-[0.16em] text-emerald-200 uppercase"
    >
      <span className="relative grid h-2 w-2 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/50" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-300" />
      </span>
      Local
    </span>
  );
}

function CapPill({ cap }: { cap: Capability }) {
  const map: Record<Capability, { icon: any; tone: string }> = {
    Code: { icon: Code2, tone: "border-violet-400/25 bg-violet-400/[0.06] text-violet-100" },
    Reasoning: { icon: Brain, tone: "border-sky-400/25 bg-sky-400/[0.06] text-sky-100" },
    Fast: { icon: Zap, tone: "border-amber-300/25 bg-amber-300/[0.06] text-amber-100" },
    Vision: { icon: Sparkles, tone: "border-fuchsia-400/25 bg-fuchsia-400/[0.06] text-fuchsia-100" },
    Math: { icon: Gauge, tone: "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-100" },
    Multilingual: { icon: Wand2, tone: "border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-100" },
  };
  const Icon = map[cap].icon;
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${map[cap].tone}`}>
      <Icon className="h-2.5 w-2.5" />
      {cap}
    </span>
  );
}

function SpeedMeter({ speed }: { speed: Speed }) {
  const cfg = {
    instant: { label: "Instant", bars: 4 },
    fast: { label: "Fast", bars: 3 },
    balanced: { label: "Balanced", bars: 2 },
    deep: { label: "Deep", bars: 1 },
  }[speed];
  return (
    <span className="flex items-center gap-1.5">
      <Zap className="h-3 w-3 text-white/40" />
      <span className="tracking-[0.18em] uppercase">{cfg.label}</span>
      <span className="flex items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full ${i < cfg.bars ? "bg-gradient-to-b from-violet-300 to-sky-300" : "bg-white/10"}`}
            style={{ height: 4 + i * 2 }}
          />
        ))}
      </span>
    </span>
  );
}
