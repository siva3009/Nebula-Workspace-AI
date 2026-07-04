import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  MessageSquare,
  FileText,
  CheckSquare,
  Library,
  StickyNote,
  Users,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Sparkles,
  Clock,
  Pin,
  Image as ImageIcon,
  Code2,
  FileArchive,
  Circle,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Brain,
  Download,
  UploadCloud,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS as _P, ACTIVITY as _A, type Project } from "../mock/devFixtures";
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];
const ACTIVITY = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _A : [];

interface Props {
  projectId: string;
  onBack: () => void;
  onOpenThread?: () => void;
}

type Tab = "overview" | "chat" | "files" | "tasks" | "knowledge" | "notes" | "team";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "knowledge", label: "Knowledge", icon: Library },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "team", label: "Team", icon: Users },
];

export function ProjectWorkspace({ projectId, onBack, onOpenThread }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const project = useMemo(() => PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0], [projectId]);
  const projectActivity = ACTIVITY.filter((a) => a.projectId === projectId).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-16 sm:px-8">
      {/* Top bar */}
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-white/45 transition hover:text-white"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All projects
      </button>

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
        <div
          className={`pointer-events-none absolute -top-20 -right-12 h-56 w-1/2 rounded-full bg-gradient-to-br ${project.color} opacity-[0.18] blur-3xl`}
        />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${project.color} text-[#0A0A0B]`}
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28 }}
            >
              {project.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
                <span>Project</span>
                {project.status === "review" && (
                  <span className="rounded-md bg-amber-400/15 px-1.5 py-0.5 text-amber-200">In review</span>
                )}
              </div>
              <h1
                className="mt-1 text-white/95"
                style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, lineHeight: 1.05 }}
              >
                {project.name}
              </h1>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-white/55">
                {project.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Updated {project.updatedAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> {project.members.length} members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Owner · <span className="text-white/70">{project.owner}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/[0.05] sm:flex">
              <Star className="h-3.5 w-3.5" /> Star
            </button>
            <button
              onClick={() => toast.success("Share link copied")}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/[0.05]"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2 text-white/60 hover:bg-white/[0.05] hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.015] p-1 [scrollbar-width:none]">
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
                <motion.span
                  layoutId="project-tab"
                  className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
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
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === "overview" && <OverviewTab project={project} activity={projectActivity} onOpenThread={onOpenThread} />}
          {tab === "chat" && <ChatTab project={project} onOpenThread={onOpenThread} />}
          {tab === "files" && <FilesTab />}
          {tab === "tasks" && <TasksTab />}
          {tab === "knowledge" && <KnowledgeTab />}
          {tab === "notes" && <NotesTab />}
          {tab === "team" && <TeamTab project={project} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────── Overview ───────── */

function OverviewTab({
  project,
  activity,
  onOpenThread,
}: {
  project: Project;
  activity: typeof ACTIVITY;
  onOpenThread?: () => void;
}) {
  const taskPct = project.tasks.total > 0 ? (project.tasks.done / project.tasks.total) * 100 : 0;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Threads", v: project.threads, i: MessageSquare },
            { l: "Files", v: project.files, i: FileText },
            { l: "Tasks", v: `${project.tasks.done}/${project.tasks.total}`, i: CheckSquare },
            { l: "Notes", v: project.notes, i: StickyNote },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-white/40 uppercase">
                <s.i className="h-3 w-3" /> {s.l}
              </div>
              <div className="mt-1 tabular-nums text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, lineHeight: 1 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <PanelCard
          title="Continue with Nebula"
          desc="Pick up where the last thread left off, or start fresh with project context loaded."
          icon={Sparkles}
        >
          <div className="space-y-2">
            {[
              { t: "Refactor checkout flow into hooks", s: "2:14 PM · 6 messages", pin: true },
              { t: "Address validation API options", s: "Yesterday · 4 messages" },
              { t: "Test plan for payment step", s: "Mon · 8 messages" },
            ].map((th, i) => (
              <button
                key={i}
                onClick={onOpenThread}
                className="group flex w-full items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] p-3 text-left transition hover:bg-white/[0.04]"
              >
                {th.pin ? (
                  <Pin className="mt-0.5 h-3.5 w-3.5 fill-violet-300/60 text-violet-300/80" />
                ) : (
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-white/45" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-white/90">{th.t}</div>
                  <div className="text-[11px] text-white/40">{th.s}</div>
                </div>
                <ArrowUpRight className="mt-1 h-3.5 w-3.5 text-white/30 transition group-hover:text-white" />
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Progress" desc="Open tasks across the project." icon={CheckSquare}>
          <div className="flex items-center justify-between text-[11.5px] text-white/55">
            <span>Tasks complete</span>
            <span className="tabular-nums text-white/90">{Math.round(taskPct)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${taskPct}%` }}
              transition={{ duration: 0.7 }}
              className={`block h-full rounded-full bg-gradient-to-r ${project.color}`}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Mini2 l="To do" v={project.tasks.total - project.tasks.done} />
            <Mini2 l="In progress" v={3} />
            <Mini2 l="Done" v={project.tasks.done} />
          </div>
        </PanelCard>

        <PanelCard title="Project intelligence" desc="What Nebula remembers about this project." icon={Brain}>
          <ul className="space-y-2 text-[12px] text-white/75">
            {[
              "Stack: React 18, react-router, react-hook-form, Stripe Elements",
              "Architecture: parent state machine coordinating step-scoped hooks",
              "Constraint: deep-link support required — URL is source of truth for step",
              "Decision: 3DS handled with confirmCardPayment outside the form submit",
            ].map((x, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-300/70" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <aside className="space-y-5">
        <PanelCard title="Team" desc={`${project.members.length} members`} icon={Users}>
          <div className="space-y-2">
            {project.members.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[10.5px] text-[#0A0A0B]`}>
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-white/90">{m.name}</div>
                  <div className="text-[10.5px] text-white/40">
                    {i === 0 ? "Owner" : "Member"}
                  </div>
                </div>
                <PresenceDot tone={i === 0 ? "active" : i === 1 ? "active" : "idle"} />
              </div>
            ))}
            <button className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11.5px] text-white/75 hover:bg-white/[0.04]">
              <Plus className="h-3 w-3" /> Invite
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Activity" icon={Activity}>
          {activity.length === 0 ? (
            <div className="text-[12px] text-white/45">No recent activity.</div>
          ) : (
            <div className="space-y-2.5">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br ${a.actor.tone} text-[9.5px] text-[#0A0A0B]`}>
                    {a.actor.initials}
                  </div>
                  <div className="min-w-0 flex-1 text-[11.5px] leading-snug text-white/75">
                    <span className="text-white/95">{a.actor.name}</span>{" "}
                    <span className="text-white/45">{a.verb}</span>{" "}
                    <span className="text-white/90">{a.target}</span>
                    <div className="mt-0.5 text-[10.5px] text-white/35">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </aside>
    </div>
  );
}

function PanelCard({
  title,
  desc,
  icon: Icon,
  children,
}: {
  title: string;
  desc?: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
      <header className="flex items-start gap-2.5 border-b border-white/[0.04] px-5 py-3.5">
        {Icon && (
          <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[12.5px] text-white/90">{title}</div>
          {desc && <div className="mt-0.5 text-[11px] text-white/40">{desc}</div>}
        </div>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Mini2({ l, v }: { l: string; v: number | string }) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-white/[0.02] p-2">
      <div className="text-[10px] tracking-[0.18em] text-white/35 uppercase">{l}</div>
      <div className="mt-0.5 tabular-nums text-[15px] text-white/95">{v}</div>
    </div>
  );
}

function PresenceDot({ tone }: { tone: "active" | "idle" | "offline" }) {
  const map = { active: "bg-emerald-400", idle: "bg-amber-400", offline: "bg-white/25" };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${map[tone]}`} />;
}

/* ───────── Tabs ───────── */

function ChatTab({ project, onOpenThread }: { project: Project; onOpenThread?: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Threads</div>
          <h2 className="mt-0.5 text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>
            Conversations in {project.name}
          </h2>
        </div>
        <button
          onClick={onOpenThread}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1.5 text-[12.5px] text-[#0A0A0B] hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> New thread
        </button>
      </div>
      <div className="space-y-2">
        {[
          { t: "Refactor checkout flow into hooks", s: "Mira · 6 messages · 2:14 PM", pin: true, badge: "Pinned" },
          { t: "Address validation API options", s: "Alex · 4 messages · Yesterday" },
          { t: "Test plan for payment step", s: "Jordan · 8 messages · Mon" },
          { t: "Stripe 3DS edge cases", s: "Mira · 12 messages · Sun" },
          { t: "Deep-link recovery on refresh", s: "Alex · 3 messages · 22 May" },
        ].map((th, i) => (
          <button
            key={i}
            onClick={onOpenThread}
            className="group flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-left transition hover:bg-white/[0.04]"
          >
            {th.pin ? (
              <Pin className="mt-0.5 h-3.5 w-3.5 fill-violet-300/60 text-violet-300/80" />
            ) : (
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-white/45" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[13px] text-white/95">{th.t}</div>
                {th.badge && (
                  <span className="rounded-md bg-violet-400/15 px-1.5 py-0.5 text-[9.5px] tracking-wider text-violet-200 uppercase">
                    {th.badge}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-white/45">{th.s}</div>
            </div>
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 text-white/30 transition group-hover:text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FilesTab() {
  const files = [
    { n: "checkout-spec-v3.pdf", s: "284 KB", k: "pdf", t: "2 hours ago", indexed: 100 },
    { n: "useCheckoutMachine.ts", s: "3.2 KB", k: "code", t: "Yesterday", indexed: 100 },
    { n: "address-form-mock.png", s: "412 KB", k: "image", t: "Yesterday", indexed: 100 },
    { n: "stripe-3ds-flow.png", s: "228 KB", k: "image", t: "Mon", indexed: 100 },
    { n: "test-fixtures.zip", s: "1.2 MB", k: "archive", t: "Mon", indexed: 64 },
    { n: "payment-arch.md", s: "8 KB", k: "doc", t: "Sun", indexed: 100 },
    { n: "useAddress.test.ts", s: "5 KB", k: "code", t: "22 May", indexed: 100 },
    { n: "competitor-analysis.pdf", s: "1.4 MB", k: "pdf", t: "20 May", indexed: 100 },
  ];
  const iconFor = (k: string) =>
    k === "pdf" ? FileText : k === "code" ? Code2 : k === "image" ? ImageIcon : k === "archive" ? FileArchive : FileText;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-white/40" />
            <input
              placeholder="Search files…"
              className="bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
            />
          </div>
          <button className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-white/55 hover:bg-white/[0.04]">
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={() => toast("Drag files anywhere to upload")}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1.5 text-[12.5px] text-[#0A0A0B] hover:brightness-110"
        >
          <UploadCloud className="h-3.5 w-3.5" /> Upload
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="grid grid-cols-[1fr_90px_90px_120px_28px] items-center gap-3 border-b border-white/[0.05] px-4 py-2.5 text-[10px] tracking-[0.22em] text-white/35 uppercase">
          <span>Name</span><span>Size</span><span>Indexed</span><span>Updated</span><span />
        </div>
        {files.map((f) => {
          const Icon = iconFor(f.k);
          return (
            <div
              key={f.n}
              className="grid grid-cols-[1fr_90px_90px_120px_28px] items-center gap-3 border-t border-white/[0.04] px-4 py-2.5 transition first:border-t-0 hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="truncate text-[12.5px] text-white/90">{f.n}</span>
              </div>
              <span className="text-[11.5px] tabular-nums text-white/55">{f.s}</span>
              <div className="flex items-center gap-2">
                {f.indexed === 100 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-violet-300/80">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400" style={{ width: `${f.indexed}%` }} />
                    </div>
                    <span className="tabular-nums">{f.indexed}%</span>
                  </div>
                )}
              </div>
              <span className="text-[11.5px] text-white/45">{f.t}</span>
              <button className="grid h-6 w-6 place-items-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: "t1", t: "Extract useCheckoutMachine from monolith", s: "done", a: "MC", p: "high" },
    { id: "t2", t: "Wire URL state sync into machine provider", s: "done", a: "AS", p: "high" },
    { id: "t3", t: "Implement useAddress with postcode verification", s: "doing", a: "JR", p: "medium" },
    { id: "t4", t: "Stripe Elements + 3DS in usePayment", s: "doing", a: "MC", p: "high" },
    { id: "t5", t: "Test deep-link recovery across all steps", s: "todo", a: "AS", p: "medium" },
    { id: "t6", t: "Refactor cart total into useCart hook", s: "todo", a: "JR", p: "low" },
    { id: "t7", t: "Add analytics events to step transitions", s: "todo", a: "AS", p: "low" },
  ]);

  const columns: { id: "todo" | "doing" | "done"; label: string; tone: string }[] = [
    { id: "todo", label: "To do", tone: "bg-white/[0.04] text-white/70" },
    { id: "doing", label: "In progress", tone: "bg-amber-400/15 text-amber-200" },
    { id: "done", label: "Done", tone: "bg-emerald-400/15 text-emerald-300" },
  ];

  const toggle = (id: string) =>
    setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, s: x.s === "done" ? "todo" : "done" } : x)));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.s === col.id);
        return (
          <div key={col.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] tracking-wider uppercase ${col.tone}`}>{col.label}</span>
                <span className="tabular-nums text-[11px] text-white/40">{items.length}</span>
              </div>
              <button className="grid h-6 w-6 place-items-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2 p-2">
              {items.map((t) => (
                <div key={t.id} className="group rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]">
                  <div className="flex items-start gap-2.5">
                    <button onClick={() => toggle(t.id)} className="mt-0.5 text-white/55 hover:text-white">
                      {t.s === "done" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[12.5px] leading-snug ${t.s === "done" ? "text-white/40 line-through" : "text-white/90"}`}>
                        {t.t}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9.5px] tracking-wider uppercase ${
                            t.p === "high"
                              ? "bg-rose-400/15 text-rose-200"
                              : t.p === "medium"
                                ? "bg-amber-400/15 text-amber-200"
                                : "bg-white/[0.05] text-white/55"
                          }`}
                        >
                          {t.p}
                        </span>
                        <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-[9px] text-[#0A0A0B]">
                          {t.a}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-[11.5px] text-white/35">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KnowledgeTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-sky-400/[0.04] p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-violet-300" />
          <div className="flex-1">
            <div className="text-[13px] text-white/95">Project context is active</div>
            <div className="mt-1 text-[12px] text-white/65">
              Nebula will reference 8 indexed files, 12 threads, and project memory whenever you ask questions inside this project.
            </div>
          </div>
          <button
            onClick={() => toast.success("Reindexing started")}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11.5px] text-white/80 hover:bg-white/[0.05]"
          >
            Reindex
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { t: "Architecture decision: parent state machine", k: "decision", s: "Captured from thread · Mira", t2: "2h ago" },
          { t: "Stripe 3DS flow constraints", k: "constraint", s: "From stripe-3ds-flow.png", t2: "Mon" },
          { t: "Postcode service: Loqate over Google", k: "decision", s: "From address-validation thread", t2: "Sun" },
          { t: "Don't store form values in URL", k: "convention", s: "Captured from thread · Alex", t2: "Sun" },
        ].map((n, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9.5px] tracking-wider text-white/65 uppercase">{n.k}</span>
              <span className="text-[10.5px] text-white/35">{n.t2}</span>
            </div>
            <div className="mt-2 text-[13px] text-white/90">{n.t}</div>
            <div className="mt-1 text-[11.5px] text-white/45">{n.s}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12.5px] text-white/90">Project memory</div>
            <div className="mt-0.5 text-[11.5px] text-white/45">14 facts learned · last updated 2 hours ago</div>
          </div>
          <button className="text-[11.5px] text-violet-300/80 hover:text-violet-200">Browse memory</button>
        </div>
      </div>
    </div>
  );
}

function NotesTab() {
  const notes = [
    { t: "Investor Q&A war-room", b: "Anticipated questions and answers from the LP partner meeting…", c: "Alex", time: "Yesterday", color: "from-violet-500/15 to-fuchsia-400/10" },
    { t: "Open architecture questions", b: "How do we coordinate cross-step validation without prop-drilling?", c: "Mira", time: "Mon", color: "from-sky-400/15 to-cyan-300/10" },
    { t: "Brand voice principles", b: "Three principles distilled from 14 reference docs — confidence, restraint, warmth.", c: "Sam", time: "Sun", color: "from-amber-300/15 to-rose-400/10" },
    { t: "Naming candidates", b: "Nebula, Aurora, Caldera, Vespers. Front-runner: Nebula.", c: "Alex", time: "22 May", color: "from-emerald-400/15 to-cyan-300/10" },
  ];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Notes & docs</div>
        <button
          onClick={() => toast.success("New note created")}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1.5 text-[12.5px] text-[#0A0A0B] hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> New note
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {notes.map((n, i) => (
          <button key={i} className={`group overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${n.color} p-5 text-left transition hover:border-white/[0.12]`}>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-white/40 uppercase">
              <StickyNote className="h-3 w-3" /> {n.c} · {n.time}
            </div>
            <h3 className="mt-2 text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.1 }}>
              {n.t}
            </h3>
            <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-white/60">{n.b}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Project team</div>
          <h2 className="mt-0.5 text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>
            {project.members.length} members
          </h2>
        </div>
        <button
          onClick={() => toast.success("Invitation sent")}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1.5 text-[12.5px] text-[#0A0A0B] hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> Invite
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {project.members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <div className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[12px] text-[#0A0A0B]`}>
              {m.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-white/95">{m.name}</div>
              <div className="text-[11.5px] text-white/45">{i === 0 ? "Owner" : "Member"} · {m.name.toLowerCase().split(" ")[0]}@nebula.app</div>
            </div>
            <PresenceDot tone={i === 0 ? "active" : i === 1 ? "active" : "idle"} />
          </div>
        ))}
      </div>
    </div>
  );
}
