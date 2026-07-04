import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "../hooks/useDebounce";
import {
  Plus,
  Search,
  Layers,
  Pin,
  PinOff,
  Clock,
  MessageSquare,
  FileText,
  CheckSquare,
  StickyNote,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Crown,
  Star,
  Filter,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./ui/empty-state";
import { PROJECTS as _P, ACTIVITY as _A, type Project } from "../mock/devFixtures";
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];
const ACTIVITY = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _A : [];

interface Props {
  onOpenProject: (id: string) => void;
}

const FILTERS = ["All", "Pinned", "Mine", "Shared", "Archived"] as const;
type Filter = (typeof FILTERS)[number];

export function ProjectsHub({ onOpenProject }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [filter, setFilter] = useState<Filter>("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filter === "Pinned" && !p.pinned) return false;
      if (filter === "Mine" && p.owner !== "Alex Stratos") return false;
      if (filter === "Shared" && p.members.length <= 1) return false;
      if (filter === "Archived" && p.status !== "archived") return false;
      if (filter !== "Archived" && p.status === "archived") return false;
      if (debouncedQuery && !p.name.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      return true;
    });
  }, [projects, filter, debouncedQuery]);

  const togglePin = (id: string) => {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
  };

  const handleCreate = (name: string) => {
    const id = `p-${Date.now()}`;
    setProjects((ps) => [
      {
        id,
        name,
        description: "Newly created project.",
        color: "from-violet-500 to-sky-400",
        emoji: "✦",
        owner: "Alex Stratos",
        updatedAt: "just now",
        status: "active",
        threads: 0,
        files: 0,
        tasks: { done: 0, total: 0 },
        notes: 0,
        members: [{ name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" }],
      },
      ...ps,
    ]);
    setCreateOpen(false);
    toast.success(`Project "${name}" created`);
    setTimeout(() => onOpenProject(id), 250);
  };

  const stats = useMemo(() => {
    const total = projects.filter((p) => p.status !== "archived").length;
    const threads = projects.reduce((n, p) => n + p.threads, 0);
    const files = projects.reduce((n, p) => n + p.files, 0);
    const tasks = projects.reduce((n, p) => n + p.tasks.total, 0);
    return { total, threads, files, tasks };
  }, [projects]);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16 sm:px-8">
        {/* Hero */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
              <Layers className="h-3 w-3" /> Workspace
            </div>
            <h1
              className="mt-2 text-white/95"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, lineHeight: 1 }}
            >
              Projects
            </h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/50">
              Group conversations, files, tasks, knowledge and notes by initiative. Nebula learns the context of each project as it grows.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-sky-400 px-4 py-2.5 text-[13px] text-[#0A0A0B] transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            New project
          </button>
        </div>

        {/* Stat strip */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Active projects", v: stats.total, i: Layers },
            { l: "Threads", v: stats.threads, i: MessageSquare },
            { l: "Files indexed", v: stats.files, i: FileText },
            { l: "Tasks tracked", v: stats.tasks, i: CheckSquare },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-white/40 uppercase">
                <s.i className="h-3 w-3" /> {s.l}
              </div>
              <div className="mt-1 tabular-nums text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 sm:w-72">
                <Search className="h-3.5 w-3.5 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects…"
                  className="flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
                <Filter className="ml-1 h-3 w-3 text-white/30" />
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`relative rounded-md px-2.5 py-1 text-[11.5px] transition ${
                      filter === f ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {filter === f && (
                      <motion.span
                        layoutId="project-filter"
                        className="absolute inset-0 rounded-md bg-white/[0.07]"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      />
                    )}
                    <span className="relative">{f}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    delay={i * 0.04}
                    onOpen={() => onOpenProject(p.id)}
                    onPin={() => togglePin(p.id)}
                  />
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={FolderOpen}
                    title={`No projects match "${query || filter}"`}
                    description="Try adjusting your search query or create a new project."
                    action={{
                      label: "Create a project",
                      onClick: () => setCreateOpen(true)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Recent activity rail */}
          <aside className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-violet-300/80" />
                <span className="text-[12.5px] text-white/85">Recent activity</span>
              </div>
              <Clock className="h-3 w-3 text-white/30" />
            </div>
            <div className="max-h-[520px] overflow-y-auto p-2 [scrollbar-width:thin]">
              {ACTIVITY.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onOpenProject(a.projectId)}
                  className="group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.03]"
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${a.actor.tone} text-[10.5px] text-[#0A0A0B]`}
                    style={{ fontFamily: a.actor.initials.length > 2 ? "'Instrument Serif', serif" : undefined }}
                  >
                    {a.actor.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] leading-relaxed text-white/80">
                      <span className="text-white/95">{a.actor.name}</span>{" "}
                      <span className="text-white/45">{a.verb}</span>{" "}
                      <span className="text-white/90">{a.target}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-white/40">
                      <span>{a.projectName}</span>
                      <span>·</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1.5 h-3 w-3 text-white/0 transition group-hover:text-white/40" />
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

function ProjectCard({
  project,
  delay,
  onOpen,
  onPin,
}: {
  project: Project;
  delay: number;
  onOpen: () => void;
  onPin: () => void;
}) {
  const taskPct = project.tasks.total > 0 ? (project.tasks.done / project.tasks.total) * 100 : 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-transparent p-5 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div
        className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${project.color} opacity-[0.10] blur-2xl transition group-hover:opacity-25`}
      />
      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${project.color} text-[#0A0A0B]`}
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20 }}
          >
            {project.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[14.5px] text-white/95">{project.name}</h3>
              {project.status === "review" && (
                <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[9.5px] tracking-wider text-amber-200 uppercase">
                  In review
                </span>
              )}
              {project.status === "archived" && (
                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9.5px] tracking-wider text-white/45 uppercase">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/50">
              {project.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Mini icon={MessageSquare} n={project.threads} />
          <Mini icon={FileText} n={project.files} />
          <Mini icon={CheckSquare} n={`${project.tasks.done}/${project.tasks.total}`} />
          <Mini icon={StickyNote} n={project.notes} />
        </div>

        {/* Progress */}
        {project.tasks.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10.5px] text-white/45">
              <span>Tasks complete</span>
              <span className="tabular-nums">{Math.round(taskPct)}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${taskPct}%` }}
                transition={{ delay: 0.2 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`block h-full rounded-full bg-gradient-to-r ${project.color}`}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {project.members.slice(0, 4).map((m, i) => (
              <div
                key={i}
                title={m.name}
                className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[9px] text-[#0A0A0B] ring-2 ring-[#0A0A0B]`}
              >
                {m.initials}
              </div>
            ))}
            {project.members.length > 4 && (
              <div className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.05] text-[9px] text-white/60 ring-2 ring-[#0A0A0B]">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-white/40">
            <Clock className="h-2.5 w-2.5" />
            {project.updatedAt}
          </div>
        </div>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin();
        }}
        className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-md text-white/40 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.06] hover:text-white"
      >
        {project.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      </button>
      {project.pinned && (
        <Star className="absolute top-3 right-3 h-3.5 w-3.5 fill-violet-300/60 text-violet-300/80 transition group-hover:opacity-0" />
      )}
    </motion.div>
  );
}

function Mini({ icon: Icon, n }: { icon: any; n: number | string }) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-white/[0.015] px-2 py-1.5">
      <div className="flex items-center gap-1 text-white/40">
        <Icon className="h-2.5 w-2.5" />
      </div>
      <div className="mt-0.5 tabular-nums text-[12px] text-white/85">{n}</div>
    </div>
  );
}

const TEMPLATES = [
  { id: "blank", name: "Blank project", desc: "Start from an empty canvas.", icon: "✦", color: "from-white/10 to-white/5" },
  { id: "engineering", name: "Engineering initiative", desc: "Chat · code · tasks · specs", icon: "◆", color: "from-violet-500 to-fuchsia-400" },
  { id: "research", name: "Research brief", desc: "Knowledge-first with notes", icon: "❋", color: "from-sky-400 to-cyan-300" },
  { id: "launch", name: "Product launch", desc: "Tasks · timeline · team", icon: "✸", color: "from-amber-300 to-rose-400" },
];

function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("engineering");
  const [color, setColor] = useState(0);
  const [visibility, setVisibility] = useState<"private" | "team">("team");

  const COLORS = [
    "from-violet-500 to-fuchsia-400",
    "from-sky-400 to-cyan-300",
    "from-amber-300 to-rose-400",
    "from-emerald-400 to-cyan-300",
    "from-fuchsia-400 to-indigo-500",
    "from-rose-400 to-orange-300",
  ];

  const reset = () => {
    setStep(0);
    setName("");
    setTemplate("engineering");
    setColor(0);
    setVisibility("team");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            setTimeout(reset, 200);
          }}
          className="fixed inset-0 z-[55] grid place-items-center bg-black/70 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            <div className="pointer-events-none absolute -top-24 right-0 h-56 w-2/3 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-violet-300" />
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                    New project · Step {step + 1} of 3
                  </div>
                  <div className="text-[13.5px] text-white/95">
                    {step === 0 ? "Choose a template" : step === 1 ? "Name & style" : "Visibility"}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative px-6 py-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="s0"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`relative overflow-hidden rounded-xl border p-4 text-left transition ${
                          template === t.id
                            ? "border-violet-400/40 bg-violet-500/[0.05]"
                            : "border-white/[0.06] hover:bg-white/[0.02]"
                        }`}
                      >
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${t.color} text-[#0A0A0B]`}
                          style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}
                        >
                          {t.icon}
                        </div>
                        <div className="mt-3 text-[13px] text-white/95">{t.name}</div>
                        <div className="mt-0.5 text-[11.5px] text-white/45">{t.desc}</div>
                        {template === t.id && (
                          <Check className="absolute top-3 right-3 h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                  >
                    <label className="block">
                      <div className="mb-1.5 text-[11px] tracking-wider text-white/45 uppercase">
                        Project name
                      </div>
                      <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Q3 marketing site"
                        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[13.5px] text-white/95 outline-none focus:border-violet-400/40 focus:bg-white/[0.04]"
                      />
                    </label>
                    <div className="mt-5">
                      <div className="mb-2 text-[11px] tracking-wider text-white/45 uppercase">
                        Accent color
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setColor(i)}
                            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c} transition ${
                              color === i ? "ring-2 ring-white/60 ring-offset-2 ring-offset-[#0C0C0E]" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${COLORS[color]} text-[#0A0A0B]`}
                          style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20 }}
                        >
                          ✦
                        </div>
                        <div>
                          <div className="text-[13px] text-white/95">{name || "Untitled project"}</div>
                          <div className="text-[11.5px] text-white/45">Preview · {TEMPLATES.find((t) => t.id === template)?.name}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-3"
                  >
                    {[
                      { id: "team" as const, t: "Team", d: "Everyone in the workspace can find and join.", icon: Users },
                      { id: "private" as const, t: "Private", d: "Only invited collaborators can see this project.", icon: Crown },
                    ].map((o) => {
                      const active = visibility === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setVisibility(o.id)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                            active ? "border-violet-400/40 bg-violet-500/[0.05]" : "border-white/[0.06] hover:bg-white/[0.02]"
                          }`}
                        >
                          <o.icon className="mt-0.5 h-4 w-4 text-white/70" />
                          <div className="flex-1">
                            <div className="text-[13px] text-white/95">{o.t}</div>
                            <div className="text-[11.5px] text-white/45">{o.d}</div>
                          </div>
                          {active && <Check className="h-4 w-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-6 py-3.5">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1 w-6 rounded-full transition ${
                      i <= step ? "bg-gradient-to-r from-violet-400 to-sky-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/75 hover:bg-white/[0.04]"
                  >
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button
                    disabled={step === 1 && !name.trim()}
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3.5 py-1.5 text-[12.5px] text-[#0A0A0B] transition hover:brightness-110 disabled:opacity-40"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onCreate(name.trim() || "Untitled project");
                      setTimeout(reset, 250);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3.5 py-1.5 text-[12.5px] text-[#0A0A0B] transition hover:brightness-110"
                  >
                    Create project <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
