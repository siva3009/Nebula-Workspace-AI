import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Crown,
  Brain,
  Feather,
  Zap,
  Code2,
  Search,
  ImageIcon,
  Calculator,
  Languages,
  ShieldCheck,
  Cpu,
  Activity,
  Wand2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Plus,
  Gauge,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "./ui/Toggle";

export type RoutedModel = {
  id: string;
  name: string;
  vendor: string;
  family: string;
  icon: any;
  color: string;
  specialty: string;
  strengths: string[];
  ctx: string;
  speed: number; // 0-100
  reasoning: number; // 0-100
  cost: number; // 0-100 (relative)
  status: "ready" | "beta" | "byok";
  blurb: string;
  tags: ("general" | "code" | "reasoning" | "vision" | "math" | "translation" | "fast")[];
};

export const ROUTED_MODELS: RoutedModel[] = [
  {
    id: "nebula-opus",
    name: "Nebula Opus 4.7",
    vendor: "Nebula",
    family: "Flagship",
    icon: Crown,
    color: "from-violet-500 to-fuchsia-400",
    specialty: "Deep reasoning",
    strengths: ["Long-context analysis", "Architecture decisions", "Multi-step planning"],
    ctx: "1M",
    speed: 55,
    reasoning: 98,
    cost: 80,
    status: "ready",
    blurb: "Default flagship for ambiguous, high-stakes problems where depth beats latency.",
    tags: ["reasoning", "general"],
  },
  {
    id: "nebula-sonnet",
    name: "Nebula Sonnet 4.6",
    vendor: "Nebula",
    family: "Balanced",
    icon: Brain,
    color: "from-sky-400 to-cyan-300",
    specialty: "Balanced everyday",
    strengths: ["Fast prose", "Tool use", "Day-to-day chat"],
    ctx: "400k",
    speed: 82,
    reasoning: 86,
    cost: 40,
    status: "ready",
    blurb: "The everyday workhorse — fast enough for chat, sharp enough for serious work.",
    tags: ["general", "reasoning"],
  },
  {
    id: "nebula-haiku",
    name: "Nebula Haiku 4.5",
    vendor: "Nebula",
    family: "Fast",
    icon: Feather,
    color: "from-emerald-400 to-cyan-300",
    specialty: "Quick replies",
    strengths: ["Short tasks", "Drafts", "Classification"],
    ctx: "200k",
    speed: 94,
    reasoning: 70,
    cost: 18,
    status: "ready",
    blurb: "Sub-second responses for short, well-scoped prompts.",
    tags: ["general", "fast"],
  },
  {
    id: "nebula-flash",
    name: "Nebula Flash",
    vendor: "Nebula",
    family: "Realtime",
    icon: Zap,
    color: "from-amber-300 to-rose-400",
    specialty: "Real-time",
    strengths: ["Streaming UI", "Live transcription", "Inline edits"],
    ctx: "128k",
    speed: 99,
    reasoning: 60,
    cost: 12,
    status: "beta",
    blurb: "Real-time inference for live experiences. Private beta.",
    tags: ["fast"],
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder V3",
    vendor: "DeepSeek",
    family: "Coding specialist",
    icon: Code2,
    color: "from-fuchsia-400 to-indigo-500",
    specialty: "Code generation",
    strengths: ["Repo-scale edits", "Diff reasoning", "Multi-file refactors"],
    ctx: "256k",
    speed: 78,
    reasoning: 92,
    cost: 24,
    status: "ready",
    blurb: "Purpose-built for code. Strong at large diffs and cross-file reasoning.",
    tags: ["code"],
  },
  {
    id: "qwen-omni",
    name: "Qwen 3 Omni",
    vendor: "Alibaba",
    family: "General assistant",
    icon: Sparkles,
    color: "from-rose-400 to-orange-300",
    specialty: "General assistant",
    strengths: ["Multilingual", "Open-ended Q&A", "Summaries"],
    ctx: "256k",
    speed: 88,
    reasoning: 80,
    cost: 14,
    status: "ready",
    blurb: "Capable open-weights generalist with strong multilingual coverage.",
    tags: ["general", "translation"],
  },
  {
    id: "claude-opus-api",
    name: "Claude Opus 4.7 API",
    vendor: "Anthropic",
    family: "Premium reasoning",
    icon: ShieldCheck,
    color: "from-amber-300 to-pink-400",
    specialty: "Premium reasoning",
    strengths: ["Nuanced writing", "Research-grade analysis", "Careful tool use"],
    ctx: "1M",
    speed: 58,
    reasoning: 99,
    cost: 92,
    status: "byok",
    blurb: "Routed through your Anthropic key for sensitive, high-precision work.",
    tags: ["reasoning", "general"],
  },
  {
    id: "vision-pro",
    name: "Nebula Vision",
    vendor: "Nebula",
    family: "Vision",
    icon: ImageIcon,
    color: "from-teal-300 to-emerald-400",
    specialty: "Image & document",
    strengths: ["Screenshots", "Charts", "Handwritten notes"],
    ctx: "400k",
    speed: 70,
    reasoning: 82,
    cost: 36,
    status: "ready",
    blurb: "Strong perception for screenshots, scans, charts and handwriting.",
    tags: ["vision"],
  },
  {
    id: "mathstral",
    name: "Mathstral 7B",
    vendor: "Mistral",
    family: "Math",
    icon: Calculator,
    color: "from-sky-400 to-violet-400",
    specialty: "Mathematics",
    strengths: ["Symbolic math", "Proofs", "Step-by-step solutions"],
    ctx: "64k",
    speed: 86,
    reasoning: 91,
    cost: 10,
    status: "ready",
    blurb: "Specialist for math-heavy queries where symbolic accuracy matters.",
    tags: ["math", "reasoning"],
  },
];

const TAG_LABEL: Record<string, string> = {
  general: "General",
  code: "Code",
  reasoning: "Reasoning",
  vision: "Vision",
  math: "Math",
  translation: "Translation",
  fast: "Fast",
};

interface Props {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
  smartRouting: boolean;
  onSmartRouting: (v: boolean) => void;
}

export function AIRouter({
  open,
  onClose,
  selectedId,
  onSelect,
  smartRouting,
  onSmartRouting,
}: Props) {
  const [tag, setTag] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [routingDemo, setRoutingDemo] = useState(
    "Refactor this 800-line checkout into step-scoped hooks and explain the trade-offs.",
  );

  const filtered = useMemo(() => {
    return ROUTED_MODELS.filter((m) => {
      if (tag !== "all" && !m.tags.includes(tag as any)) return false;
      if (query && !`${m.name} ${m.vendor} ${m.specialty}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [tag, query]);

  const recommendation = useMemo(() => recommendModel(routingDemo), [routingDemo]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full max-h-[840px] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            <div className="pointer-events-none absolute -top-24 left-1/3 h-56 w-2/3 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-1/2 rounded-full bg-sky-400/10 blur-3xl" />

            {/* Header */}
            <header className="relative flex items-start justify-between gap-6 border-b border-white/[0.06] px-7 py-5">
              <div>
                <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  <Wand2 className="h-3 w-3" /> Multi-AI routing
                </div>
                <h2
                  className="mt-1 text-white/95"
                  style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, lineHeight: 1 }}
                >
                  Choose how Nebula thinks
                </h2>
                <p className="mt-1.5 max-w-xl text-[12.5px] text-white/55">
                  Pick a model by hand, or let Nebula route each prompt to the best specialist — coding, reasoning, vision, math, or fast response.
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-white/40 hover:bg-white/[0.05] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative grid min-h-0 flex-1 grid-cols-[1fr_340px] overflow-hidden">
              {/* Models */}
              <div className="flex min-h-0 flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-7 py-3.5">
                  <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 sm:w-72">
                    <Search className="h-3.5 w-3.5 text-white/40" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search providers, specialties…"
                      className="flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
                    />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
                    {["all", "general", "code", "reasoning", "vision", "math", "fast"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`relative rounded-md px-2.5 py-1 text-[11.5px] capitalize transition ${
                          tag === t ? "text-white" : "text-white/50 hover:text-white"
                        }`}
                      >
                        {tag === t && (
                          <motion.span
                            layoutId="router-tag"
                            className="absolute inset-0 rounded-md bg-white/[0.07]"
                            transition={{ type: "spring", stiffness: 320, damping: 30 }}
                          />
                        )}
                        <span className="relative">{t === "all" ? "All" : TAG_LABEL[t]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-7 sm:grid-cols-2 [scrollbar-width:thin]">
                  {filtered.map((m) => (
                    <ModelCard
                      key={m.id}
                      model={m}
                      selected={selectedId === m.id}
                      recommended={recommendation.id === m.id}
                      onSelect={() => {
                        onSelect(m.id);
                        if (m.status === "byok") {
                          toast("Bring-your-own-key required for " + m.name, {
                            action: { label: "Add key", onClick: () => toast.success("Key added") },
                          });
                        } else {
                          toast.success("Routed to " + m.name);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Routing rail */}
              <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-white/[0.06] bg-[#0A0A0C]/60 p-6 [scrollbar-width:thin]">
                <div className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-sky-400/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="mt-0.5 h-4 w-4 text-violet-300" />
                      <div>
                        <div className="text-[13px] text-white/95">Smart routing</div>
                        <div className="mt-0.5 text-[11.5px] text-white/60">
                          Nebula picks the best model per prompt.
                        </div>
                      </div>
                    </div>
                    <Toggle checked={smartRouting} onChange={onSmartRouting} label="Smart routing" />
                  </div>
                </div>

                {/* Live router */}
                <div>
                  <div className="mb-1.5 text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    Route preview
                  </div>
                  <textarea
                    value={routingDemo}
                    onChange={(e) => setRoutingDemo(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-[12.5px] leading-relaxed text-white/90 outline-none focus:border-violet-400/40"
                  />

                  <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="border-b border-white/[0.05] px-4 py-2.5 text-[10px] tracking-[0.22em] text-white/40 uppercase">
                      Recommendation
                    </div>
                    <div className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${recommendation.color} text-[#0A0A0B]`}>
                          <recommendation.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-white/95">{recommendation.name}</div>
                          <div className="text-[11px] text-white/45">{recommendation.specialty}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-[11.5px] leading-relaxed text-white/65">
                        {recommendation.reason}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelect(recommendation.id);
                            toast.success(`Switched to ${recommendation.name}`);
                          }}
                          className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-violet-500 to-sky-400 px-2.5 py-1 text-[11.5px] text-[#0A0A0B] hover:brightness-110"
                        >
                          Use this model <ArrowRight className="h-3 w-3" />
                        </button>
                        <span className="text-[10.5px] text-white/40">Confidence {recommendation.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fallback chain */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-white/40 uppercase">
                    <Sliders className="h-3 w-3" /> Fallback chain
                  </div>
                  <div className="mt-2.5 space-y-1.5">
                    {[recommendation, ROUTED_MODELS.find((m) => m.id === "nebula-sonnet")!, ROUTED_MODELS.find((m) => m.id === "nebula-haiku")!].map((m, i) => (
                      <div key={i} className="flex items-center gap-2.5 rounded-md bg-white/[0.02] px-2.5 py-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/[0.06] text-[10px] tabular-nums text-white/60">{i + 1}</span>
                        <m.icon className="h-3.5 w-3.5 text-white/70" />
                        <span className="flex-1 truncate text-[11.5px] text-white/85">{m.name}</span>
                        <span className="text-[10px] text-white/35">{i === 0 ? "primary" : i === 1 ? "if busy" : "if rate-limit"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toast("Bring-your-own-key flow")}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[12px] text-white/80 hover:bg-white/[0.05]"
                >
                  <Plus className="h-3.5 w-3.5" /> Connect provider key
                </button>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModelCard({
  model,
  selected,
  recommended,
  onSelect,
}: {
  model: RoutedModel;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-violet-400/40 bg-violet-500/[0.06]"
          : recommended
            ? "border-emerald-400/30 bg-emerald-400/[0.04]"
            : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04]"
      }`}
    >
      <div className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${model.color} opacity-10 blur-2xl transition group-hover:opacity-25`} />

      {recommended && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[9.5px] tracking-wider text-emerald-300 uppercase">
          <Sparkles className="h-2.5 w-2.5" /> Recommended
        </span>
      )}
      {selected && !recommended && (
        <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-violet-300" />
      )}

      <div className="flex items-start gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${model.color} text-[#0A0A0B]`}>
          <model.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] text-white/95">{model.name}</span>
            {model.status === "beta" && (
              <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[9.5px] tracking-wider text-amber-200 uppercase">Beta</span>
            )}
            {model.status === "byok" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9.5px] tracking-wider text-white/65 uppercase">
                <Lock className="h-2 w-2" /> BYOK
              </span>
            )}
          </div>
          <div className="text-[11px] text-white/45">{model.vendor} · {model.specialty}</div>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-white/65">{model.blurb}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Meter label="Reason" value={model.reasoning} tone="from-violet-400 to-sky-400" />
        <Meter label="Speed" value={model.speed} tone="from-emerald-400 to-cyan-300" />
        <Meter label="Cost" value={model.cost} tone="from-amber-300 to-rose-400" invert />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10.5px] text-white/55">
        <span className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 tabular-nums">{model.ctx} ctx</span>
        {model.strengths.slice(0, 2).map((s) => (
          <span key={s} className="rounded-md bg-white/[0.04] px-1.5 py-0.5">{s}</span>
        ))}
      </div>
    </button>
  );
}

function Meter({ label, value, tone, invert }: { label: string; value: number; tone: string; invert?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span>{label}</span>
        <span className="tabular-nums">{invert ? `$${Math.round(value)}` : value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <span className={`block h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* Naive recommender — string keyword matching for demo. */
function recommendModel(prompt: string): RoutedModel & { reason: string; confidence: number } {
  const p = prompt.toLowerCase();
  const score = (m: RoutedModel) => {
    let s = 0;
    if (/(code|refactor|bug|function|class|typescript|python|hook|api)/.test(p) && m.tags.includes("code")) s += 60;
    if (/(image|screenshot|diagram|chart|pdf|scan)/.test(p) && m.tags.includes("vision")) s += 65;
    if (/(math|prove|equation|integral|derivative|theorem)/.test(p) && m.tags.includes("math")) s += 65;
    if (/(translate|french|spanish|japanese|chinese)/.test(p) && m.tags.includes("translation")) s += 55;
    if (/(why|architecture|trade.?off|reason|explain|analy[sz]e|strategy)/.test(p) && m.tags.includes("reasoning")) s += 35;
    if (/(quick|short|tldr|summari[sz]e|brief)/.test(p) && m.tags.includes("fast")) s += 40;
    if (m.tags.includes("general")) s += 12;
    if (m.status === "byok") s -= 10;
    if (m.status === "beta") s -= 15;
    return s;
  };
  let best = ROUTED_MODELS[0];
  let bestScore = -Infinity;
  for (const m of ROUTED_MODELS) {
    const s = score(m);
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }
  const confidence = Math.min(98, 55 + Math.max(0, bestScore));
  const reason =
    best.tags.includes("code") && /(code|refactor|bug|hook)/.test(p)
      ? "Detected code-shaped task — routing to a coding specialist for diff-aware reasoning."
      : best.tags.includes("vision") && /(image|screenshot|chart)/.test(p)
        ? "Detected visual input — using a vision-capable model."
        : best.tags.includes("math") && /(math|prove|equation)/.test(p)
          ? "Math content detected — using a math-specialist model."
          : best.tags.includes("reasoning") && /(architecture|trade.?off|why|explain)/.test(p)
            ? "Open-ended reasoning detected — deep-thinking model preferred."
            : "Generalist task — using a balanced model for speed and quality.";
  return { ...best, reason, confidence };
}
