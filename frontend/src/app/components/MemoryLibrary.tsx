import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "../hooks/useDebounce";
import {
  Brain,
  Search,
  Sparkles,
  Pin,
  PinOff,
  Trash2,
  FileText,
  Code2,
  Image as ImageIcon,
  FileArchive,
  Plus,
  Filter,
  Layers,
  RefreshCw,
  CheckCircle2,
  Database,
  Activity,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS as _P } from "../mock/devFixtures";
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];

type Tab = "memory" | "files" | "intelligence";

type MemoryFact = {
  id: string;
  text: string;
  source: string;
  projectId?: string;
  pinned?: boolean;
  kind: "preference" | "decision" | "fact" | "constraint";
  time: string;
};

import { FACTS as _FACTS } from "../mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const FACTS = isDemoMode ? _FACTS : [];

const KIND_TONE: Record<string, string> = {
  preference: "bg-violet-400/15 text-violet-200",
  decision: "bg-sky-400/15 text-sky-200",
  fact: "bg-emerald-400/15 text-emerald-200",
  constraint: "bg-amber-400/15 text-amber-200",
  convention: "bg-fuchsia-400/15 text-fuchsia-200",
};

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "memory", label: "AI Memory", icon: Brain },
  { id: "files", label: "Knowledge library", icon: Database },
  { id: "intelligence", label: "Workspace intelligence", icon: Sparkles },
];

export function MemoryLibrary() {
  const [tab, setTab] = useState<Tab>("memory");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
            <Brain className="h-3 w-3" /> Intelligence
          </div>
          <h1 className="mt-2 text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, lineHeight: 1 }}>
            Memory & Knowledge
          </h1>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/50">
            What Nebula knows about you, your projects, and your workspace — and how it uses that to give better answers.
          </p>
        </div>
        <button
          onClick={() => toast.success("Reindexing all sources")}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[13px] text-white/85 transition hover:bg-white/[0.05]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reindex everything
        </button>
      </div>

      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.015] p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] transition ${
                active ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {active && (
                <motion.span layoutId="mem-tab" className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]" transition={{ type: "spring", stiffness: 320, damping: 30 }} />
              )}
              <t.icon className="relative h-3.5 w-3.5" />
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {tab === "memory" && <MemoryTab />}
          {tab === "files" && <FilesTab />}
          {tab === "intelligence" && <IntelligenceTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MemoryTab() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [project, setProject] = useState<string>("all");
  const [facts, setFacts] = useState(FACTS);

  const filtered = useMemo(() => {
    return facts.filter((f) => {
      if (project !== "all") {
        if (project === "personal" && f.projectId) return false;
        if (project !== "personal" && f.projectId !== project) return false;
      }
      if (debouncedQuery && !f.text.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      return true;
    });
  }, [facts, project, debouncedQuery]);

  const pinned = filtered.filter((f) => f.pinned);
  const others = filtered.filter((f) => !f.pinned);

  const togglePin = (id: string) =>
    setFacts((fs) => fs.map((f) => (f.id === id ? { ...f, pinned: !f.pinned } : f)));
  const remove = (id: string) => {
    setFacts((fs) => fs.filter((f) => f.id !== id));
    toast.success("Memory forgotten");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 sm:w-80">
            <Search className="h-3.5 w-3.5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories…"
              className="flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-white/30" />
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/85 outline-none"
            >
              <option value="all">All scopes</option>
              <option value="personal">Personal</option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => toast.success("Memory added")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1.5 text-[12px] text-[#0A0A0B] hover:brightness-110"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
        </div>

        {pinned.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] tracking-[0.22em] text-white/35 uppercase">
              <Pin className="h-3 w-3" /> Pinned
            </div>
            <div className="space-y-2">
              {pinned.map((f) => (
                <FactRow key={f.id} fact={f} onPin={togglePin} onRemove={remove} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 text-[10px] tracking-[0.22em] text-white/35 uppercase">All memories ({others.length})</div>
          <div className="space-y-2">
            {others.map((f) => (
              <FactRow key={f.id} fact={f} onPin={togglePin} onRemove={remove} />
            ))}
            {others.length === 0 && pinned.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center text-[12px] text-white/45">
                No memories match this search.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          <div className="border-b border-white/[0.05] px-4 py-3 text-[12.5px] text-white/85">Memory overview</div>
          <div className="space-y-3 p-4">
            <Bar label="Personal" value={facts.filter((f) => !f.projectId).length} max={facts.length} tone="from-violet-500 to-sky-400" />
            {PROJECTS.slice(0, 4).map((p) => {
              const n = facts.filter((f) => f.projectId === p.id).length;
              return <Bar key={p.id} label={p.name} value={n} max={facts.length} tone={p.color} />;
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-sky-400/[0.04] p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 text-violet-300" />
            <div>
              <div className="text-[12.5px] text-white/95">How Nebula uses memory</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-white/65">
                Pinned memories are always considered. Project memories activate when you work inside their project. Personal memories follow you everywhere.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FactRow({
  fact,
  onPin,
  onRemove,
}: {
  fact: MemoryFact;
  onPin: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const project = PROJECTS.find((p) => p.id === fact.projectId);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition hover:bg-white/[0.03]"
    >
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
        <Brain className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-md px-1.5 py-0.5 text-[9.5px] tracking-wider uppercase ${KIND_TONE[fact.kind] ?? "bg-white/[0.05] text-white/70"}`}>
            {fact.kind}
          </span>
          {project && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] text-white/60">
              <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${project.color}`} />
              {project.name}
            </span>
          )}
          <span className="text-[10.5px] text-white/35">{fact.time}</span>
        </div>
        <div className="mt-1.5 text-[13px] leading-relaxed text-white/90">{fact.text}</div>
        <div className="mt-1 text-[11px] text-white/40">From {fact.source}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => onPin(fact.id)}
          title={fact.pinned ? "Unpin" : "Pin"}
          className="grid h-7 w-7 place-items-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white"
        >
          {fact.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => onRemove(fact.id)}
          title="Forget"
          className="grid h-7 w-7 place-items-center rounded-md text-rose-300/70 hover:bg-rose-500/[0.1] hover:text-rose-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {fact.pinned && (
        <Pin className="absolute mt-1 ml-1 h-3 w-3 fill-violet-300/60 text-violet-300/80 opacity-0 group-hover:opacity-0" />
      )}
    </motion.div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11.5px]">
        <span className="truncate text-white/75">{label}</span>
        <span className="tabular-nums text-white/45">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className={`block h-full rounded-full bg-gradient-to-r ${tone}`} />
      </div>
    </div>
  );
}

function FilesTab() {
  const files = [
    { n: "checkout-spec-v3.pdf", s: "284 KB", k: "pdf", t: "2h ago", p: "p-checkout", idx: 100 },
    { n: "investor-deck-v7.pdf", s: "4.2 MB", k: "pdf", t: "Yesterday", p: "p-series-b", idx: 100 },
    { n: "brand-references.zip", s: "12 MB", k: "archive", t: "Yesterday", p: "p-brand", idx: 78 },
    { n: "useCheckoutMachine.ts", s: "3.2 KB", k: "code", t: "Yesterday", p: "p-checkout", idx: 100 },
    { n: "kyoto-restaurants.md", s: "6 KB", k: "doc", t: "Mon", p: "p-kyoto", idx: 100 },
    { n: "address-form-mock.png", s: "412 KB", k: "image", t: "Mon", p: "p-checkout", idx: 100 },
    { n: "cohort-retention.csv", s: "182 KB", k: "doc", t: "Sun", p: "p-series-b", idx: 100 },
    { n: "tone-of-voice.md", s: "9 KB", k: "doc", t: "Sun", p: "p-brand", idx: 100 },
    { n: "stripe-3ds-flow.png", s: "228 KB", k: "image", t: "22 May", p: "p-checkout", idx: 100 },
  ];
  const iconFor = (k: string) => k === "pdf" ? FileText : k === "code" ? Code2 : k === "image" ? ImageIcon : k === "archive" ? FileArchive : FileText;
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const filtered = files.filter((f) => f.n.toLowerCase().includes(debouncedQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 sm:w-80">
          <Search className="h-3.5 w-3.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the knowledge library…"
            className="flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
          />
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-white/50">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1">
            <Database className="h-3 w-3" /> {files.length} files · 3.4 GB
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1 text-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> {files.filter((f) => f.idx === 100).length} ready
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="grid grid-cols-[1fr_140px_90px_120px_120px] items-center gap-3 border-b border-white/[0.05] px-4 py-2.5 text-[10px] tracking-[0.22em] text-white/35 uppercase">
          <span>File</span><span>Project</span><span>Size</span><span>Indexed</span><span>Updated</span>
        </div>
        {filtered.map((f) => {
          const Icon = iconFor(f.k);
          const p = PROJECTS.find((x) => x.id === f.p);
          return (
            <div key={f.n} className="grid grid-cols-[1fr_140px_90px_120px_120px] items-center gap-3 border-t border-white/[0.04] px-4 py-2.5 transition hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="truncate text-[12.5px] text-white/90">{f.n}</span>
              </div>
              {p ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-white/65">
                  <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${p.color}`} />
                  <span className="truncate">{p.name}</span>
                </span>
              ) : (
                <span className="text-[10.5px] text-white/35">—</span>
              )}
              <span className="text-[11.5px] tabular-nums text-white/55">{f.s}</span>
              <div>
                {f.idx === 100 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-violet-300/80">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400" style={{ width: `${f.idx}%` }} />
                    </div>
                    <span className="tabular-nums">{f.idx}%</span>
                  </div>
                )}
              </div>
              <span className="text-[11.5px] text-white/45">{f.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntelligenceTab() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="border-b border-white/[0.05] px-5 py-3.5">
          <div className="text-[12.5px] text-white/90">Indexing pipeline</div>
          <div className="mt-0.5 text-[11px] text-white/40">Live status across embeddings, OCR, and graph building</div>
        </div>
        <div className="space-y-3 px-5 py-4">
          {[
            { l: "Embeddings", pct: 100, tone: "from-emerald-400 to-cyan-300", note: "612 files vectorized" },
            { l: "OCR", pct: 84, tone: "from-violet-500 to-sky-400", note: "Processing scanned PDFs" },
            { l: "Knowledge graph", pct: 62, tone: "from-amber-300 to-rose-400", note: "Building relationships" },
            { l: "Memory consolidation", pct: 100, tone: "from-fuchsia-400 to-indigo-500", note: "Nightly run complete" },
          ].map((p) => (
            <div key={p.l}>
              <div className="mb-1 flex items-center justify-between text-[11.5px]">
                <span className="text-white/85">{p.l}</span>
                <span className="tabular-nums text-white/45">{p.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.span initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.7 }} className={`block h-full rounded-full bg-gradient-to-r ${p.tone}`} />
              </div>
              <div className="mt-0.5 text-[10.5px] text-white/40">{p.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="border-b border-white/[0.05] px-5 py-3.5 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-violet-300" />
          <div className="text-[12.5px] text-white/90">What Nebula learned today</div>
        </div>
        <div className="space-y-3 px-5 py-4">
          {[
            { t: "Surfaced 3 architecture decisions from Checkout threads", s: "Promoted to project memory" },
            { t: "Connected 22 brand reference docs into Brand voice graph", s: "Knowledge graph updated" },
            { t: "Detected your preference for ryokans over hotels", s: "Saved as personal preference" },
            { t: "Recognized recurring constraint: deep-link required for funnels", s: "Pinned to Checkout project" },
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300/80" />
              <div className="min-w-0">
                <div className="text-[12.5px] text-white/90">{x.t}</div>
                <div className="mt-0.5 text-[11px] text-white/40">{x.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] lg:col-span-2">
        <div className="border-b border-white/[0.05] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-violet-300" />
            <div className="text-[12.5px] text-white/90">Per-project intelligence</div>
          </div>
          <div className="text-[10.5px] text-white/40">Tap a project to manage its context</div>
        </div>
        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
          {PROJECTS.filter((p) => p.status !== "archived").map((p) => (
            <div key={p.id} className="group flex items-center gap-3 rounded-lg p-3 transition hover:bg-white/[0.03]">
              <div className={`grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br ${p.color} text-[#0A0A0B]`} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16 }}>
                {p.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] text-white/90">{p.name}</div>
                <div className="text-[10.5px] text-white/45">{p.files} files · {p.threads} threads · {FACTS.filter((f) => f.projectId === p.id).length} memories</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-white/25 transition group-hover:text-white/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
