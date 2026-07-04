import { useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarRange,
  Sparkles,
  Plus,
  Filter,
  ListChecks,
  LayoutGrid,
  Map,
  GanttChart,
  Flag,
  CheckCircle2,
  Circle,
  ChevronRight,
  Clock,
  ArrowRight,
  Wand2,
  Target,
  TrendingUp,
  Search,
} from "lucide-react";
import { HoverDepth, Magnetic, Stagger, StaggerItem, SPRING } from "./motion/Primitives";
import { PROJECTS as _P } from "../mock/devFixtures";
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];

type Priority = "p0" | "p1" | "p2" | "p3";
type Status = "backlog" | "todo" | "doing" | "review" | "done";

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: Status;
  priority: Priority;
  assignee: { name: string; initials: string; tone: string };
  due?: string;
  estimate: number; // hours
  sprint?: string;
  tags: string[];
};

type Sprint = {
  id: string;
  name: string;
  range: string;
  progress: number;
  status: "active" | "next" | "past";
};

type Milestone = {
  id: string;
  title: string;
  projectId: string;
  date: string;
  status: "shipped" | "on-track" | "at-risk";
};

import { AVATARS as _AVATARS, SPRINTS as _SPRINTS, TASKS as _TASKS, MILESTONES as _MILESTONES, AI_SUGGESTIONS as _AI_SUGGESTIONS } from "../mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const AVATARS = isDemoMode ? _AVATARS : {};
const SPRINTS = isDemoMode ? _SPRINTS : [];
const TASKS = isDemoMode ? _TASKS : [];
const MILESTONES = isDemoMode ? _MILESTONES : [];
const AI_SUGGESTIONS = isDemoMode ? _AI_SUGGESTIONS : [];

const VIEWS = [
  { id: "tasks" as const, label: "Tasks", icon: ListChecks },
  { id: "board" as const, label: "Sprint board", icon: LayoutGrid },
  { id: "roadmap" as const, label: "Roadmap", icon: Map },
  { id: "timeline" as const, label: "Timeline", icon: GanttChart },
];

type ViewId = (typeof VIEWS)[number]["id"];

export function PlannerWorkspace() {
  const [view, setView] = useState<ViewId>("board");
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
      if (debouncedQuery && !t.title.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, projectFilter, debouncedQuery]);

  const stats = useMemo(() => {
    const done = filtered.filter((t) => t.status === "done").length;
    const active = filtered.filter((t) => t.status === "doing" || t.status === "review").length;
    const overdue = filtered.filter((t) => t.priority === "p0" && t.status !== "done").length;
    return { total: filtered.length, done, active, overdue };
  }, [filtered]);

  const setStatus = (id: string, status: Status) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-10 sm:px-6 sm:pt-8">
      {/* Hero */}
      <HoverDepth className="group rounded-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0E0E10] via-[#0C0C0E] to-[#0A0A0B] p-6 sm:p-7">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10.5px] tracking-[0.3em] text-white/40 uppercase">
                <CalendarRange className="h-3 w-3" />
                Planner
              </div>
              <h1
                className="mt-2 text-white"
                style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, lineHeight: 1.05 }}
              >
                What we're shipping this fortnight
              </h1>
              <p className="mt-2 max-w-2xl text-[13.5px] text-white/55">
                Sprint 14 · 27 May → 9 Jun. Nebula is planning alongside you — re-balancing load, flagging risk, and watching milestones.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Stat label="Active" value={stats.active} tone="violet" />
                <Stat label="Done" value={stats.done} tone="emerald" />
                <Stat label="P0 open" value={stats.overdue} tone="rose" />
                <Stat label="Total" value={stats.total} tone="slate" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Magnetic className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12.5px] text-white/80 transition hover:bg-white/[0.08]">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Magnetic>
              <Magnetic className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-sky-400 px-3.5 py-2 text-[12.5px] text-[#0A0A0B] shadow-[0_10px_28px_-12px_rgba(139,92,246,0.7)] transition hover:brightness-110">
                <Plus className="h-3.5 w-3.5" />
                New task
              </Magnetic>
            </div>
          </div>
        </div>
      </HoverDepth>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-2">
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.02] p-1">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] transition ${
                  active ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="planner-view"
                    transition={SPRING.page}
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]"
                  />
                )}
                <Icon className="relative h-3.5 w-3.5" />
                <span className="relative">{v.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-56 rounded-lg border border-white/[0.06] bg-white/[0.02] py-1.5 pr-2 pl-7 text-[12px] text-white placeholder:text-white/30 focus:border-white/15 focus:outline-none"
            />
          </div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/75 focus:border-white/15 focus:outline-none"
          >
            <option value="all">All projects</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji} {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "tasks" && <TasksView tasks={filtered} onStatus={setStatus} />}
              {view === "board" && <BoardView tasks={filtered} onStatus={setStatus} />}
              {view === "roadmap" && <RoadmapView />}
              {view === "timeline" && <TimelineView tasks={filtered} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Planning rail */}
        <aside className="space-y-3">
          <HoverDepth className="group rounded-2xl" intensity={3}>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/80 p-4">
              <div className="flex items-center gap-2">
                <span className="relative grid h-7 w-7 place-items-center">
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 opacity-60 blur-md" />
                  <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-400">
                    <Sparkles className="h-3.5 w-3.5 text-[#0A0A0B]" strokeWidth={2.4} />
                  </span>
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] text-white/90">Planning assistant</div>
                  <div className="text-[10.5px] text-white/40">Watches load, risk & cadence</div>
                </div>
              </div>
              <Stagger className="mt-3 space-y-2" gap={0.07}>
                {AI_SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <StaggerItem key={s.id}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={SPRING.hover}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center gap-2 text-[11.5px] text-white/85">
                          <Icon className="h-3.5 w-3.5 text-violet-300" />
                          {s.title}
                        </div>
                        <p className="mt-1 text-[11.5px] text-white/55">{s.body}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="rounded-md bg-white/90 px-2.5 py-1 text-[10.5px] text-[#0A0A0B] transition hover:bg-white">
                            Apply
                          </button>
                          <button className="rounded-md px-2 py-1 text-[10.5px] text-white/45 transition hover:text-white">
                            Snooze
                          </button>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
              <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11.5px] text-white/75 transition hover:bg-white/[0.08]">
                Ask Nebula to plan next sprint
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </HoverDepth>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Sprints</span>
              <Clock className="h-3.5 w-3.5 text-white/30" />
            </div>
            <Stagger className="space-y-2">
              {SPRINTS.map((s) => (
                <StaggerItem key={s.id}>
                  <SprintRow sprint={s} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Today's focus</span>
              <span className="text-[10.5px] text-emerald-300/80">smart-sorted</span>
            </div>
            <ul className="space-y-1.5">
              {tasks
                .filter((t) => t.priority === "p0" || t.priority === "p1")
                .slice(0, 4)
                .map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2"
                  >
                    <PriorityDot p={t.priority} />
                    <span className="flex-1 truncate text-[11.5px] text-white/85">{t.title}</span>
                    <Avatar a={t.assignee} />
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ────────── Views ────────── */

function BoardView({ tasks, onStatus }: { tasks: Task[]; onStatus: (id: string, s: Status) => void }) {
  const cols: { id: Status; label: string; tone: string }[] = [
    { id: "todo", label: "To do", tone: "from-slate-400 to-slate-300" },
    { id: "doing", label: "Doing", tone: "from-violet-500 to-sky-400" },
    { id: "review", label: "Review", tone: "from-amber-300 to-rose-400" },
    { id: "done", label: "Done", tone: "from-emerald-400 to-cyan-300" },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cols.map((c) => {
        const list = tasks.filter((t) => t.status === c.id);
        return (
          <div key={c.id} className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/60 p-3">
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${c.tone}`} />
                <span className="text-[11px] tracking-[0.18em] text-white/55 uppercase">{c.label}</span>
                <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/45">{list.length}</span>
              </div>
              <button className="rounded-md p-1 text-white/35 transition hover:bg-white/[0.05] hover:text-white">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <Stagger className="space-y-2" gap={0.04}>
              {list.map((t) => (
                <StaggerItem key={t.id}>
                  <TaskCard task={t} onStatus={onStatus} />
                </StaggerItem>
              ))}
              {list.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.06] py-6 text-center text-[11px] text-white/30">
                  Empty
                </div>
              )}
            </Stagger>
          </div>
        );
      })}
    </div>
  );
}

function TasksView({ tasks, onStatus }: { tasks: Task[]; onStatus: (id: string, s: Status) => void }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/60">
      <Stagger gap={0.025}>
        {tasks.map((t) => (
          <StaggerItem key={t.id}>
            <motion.div
              whileHover={{ x: 2 }}
              transition={SPRING.hover}
              className="group flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0"
            >
              <button
                onClick={() =>
                  onStatus(t.id, t.status === "done" ? "todo" : "done")
                }
                className="shrink-0 transition"
              >
                {t.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30 transition group-hover:text-white/70" />
                )}
              </button>
              <PriorityDot p={t.priority} />
              <span
                className={`flex-1 truncate text-[12.5px] ${t.status === "done" ? "text-white/40 line-through" : "text-white/90"}`}
              >
                {t.title}
              </span>
              <div className="hidden items-center gap-1.5 sm:flex">
                {t.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ProjectChip projectId={t.projectId} />
              {t.due && (
                <span className="hidden items-center gap-1 text-[10.5px] text-white/45 md:flex">
                  <Clock className="h-3 w-3" />
                  {t.due}
                </span>
              )}
              <span className="text-[10.5px] text-white/40 tabular-nums">{t.estimate}h</span>
              <Avatar a={t.assignee} />
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

function RoadmapView() {
  const months = ["May", "Jun", "Jul", "Aug"];
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/60 p-4">
      <div className="grid grid-cols-4 gap-1 border-b border-white/[0.05] pb-2 text-[10.5px] tracking-[0.22em] text-white/40 uppercase">
        {months.map((m) => (
          <div key={m}>{m}</div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {PROJECTS.slice(0, 4).map((p, i) => {
          const start = [0, 1, 1, 2][i];
          const span = [2, 2, 3, 2][i];
          return (
            <div key={p.id} className="grid grid-cols-4 items-center gap-1">
              <div className="col-span-4 -mb-1 flex items-center gap-2 text-[12px] text-white/85">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br ${p.color} text-[10px]`}
                >
                  {p.emoji}
                </span>
                {p.name}
              </div>
              <div className="col-span-4 grid grid-cols-4 gap-1">
                {months.map((_, idx) => (
                  <div key={idx} className="h-9 rounded-lg bg-white/[0.02]" />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
                style={{ gridColumn: `${start + 1} / span ${span}`, transformOrigin: "left" }}
                className={`-mt-9 h-9 rounded-lg bg-gradient-to-r ${p.color} px-3 text-[11px] text-[#0A0A0B] shadow-[0_10px_28px_-14px_rgba(139,92,246,0.6)] flex items-center`}
              >
                <span className="truncate">{p.name}</span>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {MILESTONES.map((m) => {
          const p = PROJECTS.find((pp) => pp.id === m.projectId);
          const tone =
            m.status === "shipped"
              ? "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-200"
              : m.status === "on-track"
                ? "border-sky-400/25 bg-sky-400/[0.06] text-sky-200"
                : "border-rose-400/25 bg-rose-400/[0.06] text-rose-200";
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <Flag className="h-4 w-4 text-white/45" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] text-white/90">{m.title}</div>
                <div className="truncate text-[10.5px] text-white/45">
                  {p?.name} · {m.date}
                </div>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${tone}`}>
                {m.status.replace("-", " ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineView({ tasks }: { tasks: Task[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const grouped = days.map((d) => ({ d, items: tasks.filter((t) => t.due === d) }));
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/60 p-4">
      <div className="grid grid-cols-5 gap-2">
        {grouped.map(({ d, items }) => (
          <div key={d} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
            <div className="px-1 pb-2 text-[10.5px] tracking-[0.22em] text-white/40 uppercase">{d}</div>
            <div className="space-y-1.5">
              {items.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -2 }}
                  transition={SPRING.hover}
                  className="rounded-lg border border-white/[0.06] bg-[#0E0E10] p-2"
                >
                  <div className="flex items-center gap-1.5">
                    <PriorityDot p={t.priority} />
                    <span className="truncate text-[11.5px] text-white/85">{t.title}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/40">
                    <ProjectChip projectId={t.projectId} compact />
                    <span className="tabular-nums">{t.estimate}h</span>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/[0.05] py-4 text-center text-[10.5px] text-white/30">
                  free
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── Pieces ────────── */

function TaskCard({ task, onStatus }: { task: Task; onStatus: (id: string, s: Status) => void }) {
  return (
    <HoverDepth intensity={3} glow={false} className="group rounded-xl">
      <div className="rounded-xl border border-white/[0.06] bg-[#0E0E10] p-3 transition group-hover:border-white/[0.12]">
        <div className="flex items-start gap-2">
          <button
            onClick={() => onStatus(task.id, task.status === "done" ? "todo" : "done")}
            className="mt-0.5 shrink-0"
          >
            {task.status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <Circle className="h-4 w-4 text-white/30 transition group-hover:text-white/70" />
            )}
          </button>
          <p
            className={`flex-1 text-[12.5px] leading-snug ${task.status === "done" ? "text-white/40 line-through" : "text-white/90"}`}
          >
            {task.title}
          </p>
          <PriorityDot p={task.priority} />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <ProjectChip projectId={task.projectId} compact />
          <div className="flex items-center gap-1.5">
            {task.due && (
              <span className="flex items-center gap-1 text-[10px] text-white/45">
                <Clock className="h-3 w-3" />
                {task.due}
              </span>
            )}
            <span className="text-[10px] text-white/45 tabular-nums">{task.estimate}h</span>
            <Avatar a={task.assignee} />
          </div>
        </div>
      </div>
    </HoverDepth>
  );
}

function ProjectChip({ projectId, compact }: { projectId: string; compact?: boolean }) {
  const p = PROJECTS.find((x) => x.id === projectId);
  if (!p) return null;
  return (
    <span
      className={`flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] py-0.5 text-white/65 ${compact ? "max-w-[140px] pr-2 pl-1 text-[10px]" : "max-w-[160px] pr-2 pl-1 text-[11px]"}`}
    >
      <span className={`grid h-3.5 w-3.5 place-items-center rounded-sm bg-gradient-to-br ${p.color} text-[9px]`}>
        {p.emoji}
      </span>
      <span className="truncate">{p.name}</span>
    </span>
  );
}

function PriorityDot({ p }: { p: Priority }) {
  const map = {
    p0: { ring: "ring-rose-400/40", dot: "bg-rose-400", label: "P0" },
    p1: { ring: "ring-amber-300/40", dot: "bg-amber-300", label: "P1" },
    p2: { ring: "ring-sky-400/40", dot: "bg-sky-400", label: "P2" },
    p3: { ring: "ring-white/15", dot: "bg-white/40", label: "P3" },
  }[p];
  return (
    <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] uppercase ring-1 ${map.ring} text-white/65`}>
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

function Avatar({ a }: { a: { initials: string; tone: string; name: string } }) {
  return (
    <span
      title={a.name}
      className={`grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br ${a.tone} text-[9px] text-[#0A0A0B]`}
    >
      {a.initials}
    </span>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "violet" | "emerald" | "rose" | "slate" }) {
  const tones = {
    violet: "from-violet-500/15 to-sky-400/10 text-violet-100 border-violet-400/20",
    emerald: "from-emerald-400/15 to-cyan-300/10 text-emerald-100 border-emerald-400/20",
    rose: "from-rose-400/15 to-amber-300/10 text-rose-100 border-rose-400/20",
    slate: "from-white/[0.06] to-white/[0.02] text-white/80 border-white/[0.08]",
  }[tone];
  return (
    <span className={`flex items-baseline gap-2 rounded-full border bg-gradient-to-r px-3 py-1 text-[11px] ${tones}`}>
      <span className="tabular-nums" style={{ fontSize: 13 }}>
        {value}
      </span>
      <span className="tracking-[0.18em] uppercase opacity-70">{label}</span>
    </span>
  );
}

function SprintRow({ sprint }: { sprint: Sprint }) {
  const tone =
    sprint.status === "active"
      ? "border-violet-400/25 bg-violet-400/[0.06]"
      : sprint.status === "next"
        ? "border-white/[0.06] bg-white/[0.02]"
        : "border-white/[0.04] bg-transparent opacity-60";
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <div className="flex items-center justify-between">
        <span className="truncate text-[12px] text-white/90">{sprint.name}</span>
        <ChevronRight className="h-3.5 w-3.5 text-white/35" />
      </div>
      <div className="mt-1 text-[10.5px] text-white/45">{sprint.range}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${sprint.progress * 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="block h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400"
        />
      </div>
    </div>
  );
}
