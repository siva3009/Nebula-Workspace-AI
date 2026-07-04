import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Crown,
  UserPlus,
  Mail,
  MessageSquare,
  Layers,
  Activity,
  X,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { TEAM as _T, PROJECTS as _P, ACTIVITY as _A } from "../mock/devFixtures";
const TEAM = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _T : [];
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];
const ACTIVITY = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _A : [];

interface Props {
  onOpenProject: (id: string) => void;
}

type Tab = "members" | "shared" | "conversations" | "activity";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "members", label: "Members", icon: Users },
  { id: "shared", label: "Shared projects", icon: Layers },
  { id: "conversations", label: "Shared chats", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
];

export function TeamWorkspace({ onOpenProject }: Props) {
  const [tab, setTab] = useState<Tab>("members");
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16 sm:px-8">
      {/* Hero */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/40 uppercase">
            <Users className="h-3 w-3" /> Workspace · Stratos Studio
          </div>
          <h1 className="mt-2 text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 44, lineHeight: 1 }}>
            Team
          </h1>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/50">
            Collaborate on projects, share AI conversations, and keep context in sync across the team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PresenceStrip />
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-sky-400 px-4 py-2.5 text-[13px] text-[#0A0A0B] transition hover:brightness-110"
          >
            <UserPlus className="h-4 w-4" /> Invite member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Members", v: TEAM.length, i: Users },
          { l: "Active now", v: TEAM.filter((t) => t.presence === "active").length, i: Activity },
          { l: "Shared projects", v: PROJECTS.filter((p) => p.members.length > 1).length, i: Layers },
          { l: "Shared chats", v: 14, i: MessageSquare },
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
                  layoutId="team-tab"
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
          transition={{ duration: 0.22 }}
        >
          {tab === "members" && <MembersTab />}
          {tab === "shared" && <SharedProjectsTab onOpenProject={onOpenProject} />}
          {tab === "conversations" && <SharedChatsTab />}
          {tab === "activity" && <TeamActivityTab onOpenProject={onOpenProject} />}
        </motion.div>
      </AnimatePresence>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

function PresenceStrip() {
  const active = TEAM.filter((t) => t.presence === "active");
  return (
    <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 md:flex">
      <span className="text-[10px] tracking-[0.22em] text-white/40 uppercase">Online</span>
      <div className="flex -space-x-2">
        {active.map((m) => (
          <div key={m.id} className="relative">
            <div className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[10px] text-[#0A0A0B] ring-2 ring-[#0A0A0B]`}>
              {m.initials}
            </div>
            <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0B]" />
          </div>
        ))}
      </div>
      <span className="tabular-nums text-[11px] text-white/60">{active.length}</span>
    </div>
  );
}

function MembersTab() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | "owner" | "admin" | "member" | "guest">("all");
  const filtered = useMemo(() => {
    return TEAM.filter((m) => {
      if (role !== "all" && m.role.toLowerCase() !== role) return false;
      if (query && !m.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, role]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
          <Search className="h-3.5 w-3.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
          {(["all", "owner", "admin", "member", "guest"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`relative rounded-md px-2.5 py-1 text-[11.5px] capitalize transition ${
                role === r ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {role === r && (
                <motion.span layoutId="role-filter" className="absolute inset-0 rounded-md bg-white/[0.07]" transition={{ type: "spring", stiffness: 320, damping: 30 }} />
              )}
              <span className="relative">{r}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        <div className="grid grid-cols-[1fr_120px_140px_120px_28px] items-center gap-3 border-b border-white/[0.05] px-4 py-2.5 text-[10px] tracking-[0.22em] text-white/35 uppercase">
          <span>Member</span><span>Role</span><span>Projects</span><span>Status</span><span />
        </div>
        {filtered.map((m) => (
          <div key={m.id} className="grid grid-cols-[1fr_120px_140px_120px_28px] items-center gap-3 border-t border-white/[0.04] px-4 py-3 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[11px] text-[#0A0A0B]`}>
                  {m.initials}
                </div>
                <PresenceRing tone={m.presence as any} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] text-white/95">{m.name}</div>
                <div className="truncate text-[11px] text-white/45">{m.title} · {m.email}</div>
              </div>
            </div>
            <RoleBadge role={m.role} />
            <div className="flex -space-x-1.5">
              {m.projects.slice(0, 4).map((pid) => {
                const p = PROJECTS.find((x) => x.id === pid);
                if (!p) return null;
                return (
                  <div key={pid} title={p.name} className={`grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br ${p.color} text-[10px] text-[#0A0A0B] ring-2 ring-[#0A0A0B]`} style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {p.emoji}
                  </div>
                );
              })}
              {m.projects.length > 4 && (
                <div className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.06] text-[10px] text-white/60 ring-2 ring-[#0A0A0B]">+{m.projects.length - 4}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PresenceRing tone={m.presence as any} bare />
              <span className="text-[11px] text-white/65 capitalize">{m.presence}</span>
            </div>
            <button className="grid h-6 w-6 place-items-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-[12px] text-white/45">No members match this filter.</div>
        )}
      </div>
    </div>
  );
}

function PresenceRing({ tone, bare }: { tone: "active" | "idle" | "offline"; bare?: boolean }) {
  const color = tone === "active" ? "bg-emerald-400" : tone === "idle" ? "bg-amber-400" : "bg-white/25";
  if (bare) return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
  return <span className={`absolute right-0 bottom-0 h-2 w-2 rounded-full ${color} ring-2 ring-[#0A0A0B]`} />;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    Owner: "bg-violet-500/15 text-violet-200",
    Admin: "bg-sky-400/15 text-sky-200",
    Member: "bg-white/[0.05] text-white/70",
    Guest: "bg-amber-400/15 text-amber-200",
  };
  const Icon = role === "Owner" ? Crown : role === "Admin" ? Shield : Users;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] tracking-wider uppercase ${map[role] ?? "bg-white/[0.05]"}`}>
      <Icon className="h-2.5 w-2.5" /> {role}
    </span>
  );
}

function SharedProjectsTab({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const shared = PROJECTS.filter((p) => p.members.length > 1);
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {shared.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpenProject(p.id)}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 text-left transition hover:bg-white/[0.04]"
        >
          <div className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} opacity-10 blur-2xl group-hover:opacity-20`} />
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${p.color} text-[#0A0A0B]`} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>
              {p.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] text-white/95">{p.name}</div>
              <div className="mt-0.5 line-clamp-1 text-[11.5px] text-white/45">{p.description}</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {p.members.map((m, i) => (
                <div key={i} className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${m.tone} text-[9.5px] text-[#0A0A0B] ring-2 ring-[#0A0A0B]`}>{m.initials}</div>
              ))}
            </div>
            <div className="text-[10.5px] text-white/45">
              {p.threads} threads · {p.files} files
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SharedChatsTab() {
  const chats = [
    { t: "Refactor checkout flow into hooks", p: "Checkout refactor", color: "from-violet-500 to-fuchsia-400", participants: ["AS", "MC", "JR"], n: 6, last: "2 min ago" },
    { t: "Cohort retention SQL — investor slide", p: "Series-B narrative", color: "from-sky-400 to-cyan-300", participants: ["AS", "PN"], n: 12, last: "1 hour ago" },
    { t: "Brand voice principles workshop", p: "Brand voice", color: "from-amber-300 to-rose-400", participants: ["MC", "SO", "LP", "AS"], n: 22, last: "Yesterday" },
    { t: "Kyoto restaurant shortlist", p: "Kyoto itinerary", color: "from-emerald-400 to-cyan-300", participants: ["AS"], n: 4, last: "Mon" },
  ];
  return (
    <div className="space-y-2">
      {chats.map((c, i) => (
        <div key={i} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition hover:bg-white/[0.04]">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.color} text-[#0A0A0B]`}>
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-white/95">{c.t}</div>
            <div className="mt-0.5 text-[11px] text-white/45">{c.p} · {c.n} messages · {c.last}</div>
          </div>
          <div className="hidden -space-x-1.5 sm:flex">
            {c.participants.map((p, j) => (
              <div key={j} className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-[9.5px] text-[#0A0A0B] ring-2 ring-[#0A0A0B]">{p}</div>
            ))}
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white" />
        </div>
      ))}
    </div>
  );
}

function TeamActivityTab({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
      {ACTIVITY.map((a) => (
        <button
          key={a.id}
          onClick={() => onOpenProject(a.projectId)}
          className="group flex w-full items-start gap-3 border-t border-white/[0.04] px-5 py-3.5 text-left transition first:border-t-0 hover:bg-white/[0.03]"
        >
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${a.actor.tone} text-[11px] text-[#0A0A0B]`}>
            {a.actor.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white/85">
              <span className="text-white/95">{a.actor.name}</span>{" "}
              <span className="text-white/45">{a.verb}</span>{" "}
              <span className="text-white/95">{a.target}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
              <span>in {a.projectName}</span>
              <span>·</span>
              <span>{a.time}</span>
            </div>
          </div>
          <ArrowRight className="mt-1 h-3.5 w-3.5 text-white/0 transition group-hover:text-white/45" />
        </button>
      ))}
    </div>
  );
}

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<"Admin" | "Member" | "Guest">("Member");
  const [projects, setProjects] = useState<string[]>(["p-checkout"]);

  const toggleProject = (id: string) =>
    setProjects((ps) => (ps.includes(id) ? ps.filter((x) => x !== id) : [...ps, id]));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[55] grid place-items-center bg-black/70 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            <div className="pointer-events-none absolute -top-20 right-0 h-48 w-2/3 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4 text-violet-300" />
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Invite member</div>
                  <div className="text-[13.5px] text-white/95">Add someone to Stratos Studio</div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative space-y-5 px-6 py-6">
              <label className="block">
                <div className="mb-1.5 text-[11px] tracking-wider text-white/45 uppercase">Email addresses</div>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={3}
                  placeholder="name@company.com, another@company.com"
                  className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white/95 outline-none focus:border-violet-400/40 focus:bg-white/[0.04]"
                />
                <div className="mt-1 text-[11px] text-white/35">Separate multiple emails with commas.</div>
              </label>

              <div>
                <div className="mb-1.5 text-[11px] tracking-wider text-white/45 uppercase">Role</div>
                <div className="flex gap-2">
                  {(["Admin", "Member", "Guest"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-[12.5px] transition ${
                        role === r ? "border-violet-400/40 bg-violet-500/[0.08] text-white" : "border-white/[0.06] text-white/65 hover:bg-white/[0.03]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[11px] tracking-wider text-white/45 uppercase">Add to projects</div>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECTS.slice(0, 4).map((p) => {
                    const on = projects.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleProject(p.id)}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition ${
                          on ? "border-violet-400/40 bg-violet-500/[0.05]" : "border-white/[0.06] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className={`grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br ${p.color} text-[#0A0A0B]`} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14 }}>
                          {p.emoji}
                        </div>
                        <span className="flex-1 truncate text-[12px] text-white/85">{p.name}</span>
                        {on && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-6 py-3.5">
              <button
                onClick={() => toast("Invite link copied")}
                className="inline-flex items-center gap-1.5 rounded-md text-[11.5px] text-white/55 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" /> Copy invite link
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/75 hover:bg-white/[0.04]">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const n = emails.split(",").map((s) => s.trim()).filter(Boolean).length || 1;
                    toast.success(`${n} invitation${n === 1 ? "" : "s"} sent as ${role}`);
                    onClose();
                  }}
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3.5 py-1.5 text-[12.5px] text-[#0A0A0B] hover:brightness-110"
                >
                  Send invites
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
