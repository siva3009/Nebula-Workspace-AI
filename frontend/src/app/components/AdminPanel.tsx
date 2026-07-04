import { useState } from "react";
import { motion } from "motion/react";
import { Toggle } from "./ui/Toggle";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Users,
  Activity,
  CircleDollarSign,
  Sparkles,
  Crown,
  Brain,
  Feather,
  Zap,
  MoreHorizontal,
  Shield,
  KeyRound,
  Database,
  Bell,
  ChevronRight,
} from "lucide-react";

const USAGE = Array.from({ length: 14 }).map((_, i) => ({
  d: `${i + 1}`,
  tokens: 12 + Math.round(Math.sin(i / 1.6) * 8 + Math.random() * 6 + i * 1.2),
  cost: 4 + Math.round(Math.sin(i / 1.4) * 3 + Math.random() * 2 + i * 0.4),
}));

const MODEL_USAGE = [
  { name: "Opus", value: 48 },
  { name: "Sonnet", value: 73 },
  { name: "Haiku", value: 32 },
  { name: "Flash", value: 18 },
];

const TEAM = [
  { name: "Alex Kowalski", email: "alex@nebula.ai", role: "Owner", status: "active", usage: 84 },
  { name: "Mira Tan", email: "mira@nebula.ai", role: "Admin", status: "active", usage: 62 },
  { name: "Jordan Wells", email: "jordan@nebula.ai", role: "Member", status: "active", usage: 47 },
  { name: "Sana Iqbal", email: "sana@nebula.ai", role: "Member", status: "idle", usage: 12 },
  { name: "Leo Bernard", email: "leo@nebula.ai", role: "Member", status: "invited", usage: 0 },
];

const MODELS = [
  { id: "opus", name: "Nebula Opus 4.7", icon: Crown, accent: "from-violet-400 to-fuchsia-400", on: true, latency: "1.4s", cost: "$15 / 1M" },
  { id: "sonnet", name: "Nebula Sonnet 4.6", icon: Brain, accent: "from-sky-400 to-cyan-300", on: true, latency: "640ms", cost: "$3 / 1M" },
  { id: "haiku", name: "Nebula Haiku 4.5", icon: Feather, accent: "from-emerald-300 to-teal-300", on: true, latency: "280ms", cost: "$0.80 / 1M" },
  { id: "flash", name: "Nebula Flash", icon: Zap, accent: "from-amber-300 to-rose-300", on: false, latency: "180ms", cost: "Beta" },
];

export function AdminPanel() {
  const [tab, setTab] = useState<"overview" | "models" | "team" | "system">("overview");

  return (
    <div className="relative mx-auto w-full max-w-7xl px-6 pt-10 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Control · Nebula workspace
          </div>
          <h1
            className="mt-2 text-white"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(38px, 4.5vw, 58px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Mission control
          </h1>
        </div>
        <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
          {(["overview", "models", "team", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-lg px-3 py-1.5 text-[12px] capitalize transition ${
                tab === t ? "text-white" : "text-white/45 hover:text-white"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-lg bg-white/[0.08]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <Overview />}
      {tab === "models" && <Models />}
      {tab === "team" && <Team />}
      {tab === "system" && <System />}
    </div>
  );
}

function Overview() {
  return (
    <div className="mt-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Active members", value: "24", delta: "+3", icon: Users, tone: "violet" },
          { label: "Conversations today", value: "1,284", delta: "+18%", icon: Activity, tone: "sky" },
          { label: "Tokens this month", value: "12.4M", delta: "62%", icon: TrendingUp, tone: "emerald" },
          { label: "Monthly cost", value: "$3,420", delta: "−8% vs Apr", icon: CircleDollarSign, tone: "amber" },
        ].map((k) => (
          <KPI key={k.label} {...k} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Token volume" sub="Last 14 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={USAGE} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="d" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,15,17,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#a78bfa" strokeWidth={1.6} fill="url(#g1)" />
              <Area type="monotone" dataKey="cost" stroke="#7dd3fc" strokeWidth={1.6} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By model" sub="Calls this week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MODEL_USAGE} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="bar" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "rgba(15,15,17,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#bar)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity */}
      <ChartCard title="Live activity" sub="Across your workspace">
        <div className="-mx-1 divide-y divide-white/[0.04]">
          {[
            { who: "Mira Tan", action: "queried Opus", what: "Revenue cohort analysis", time: "2m ago" },
            { who: "Jordan Wells", action: "uploaded", what: "design-spec-v3.pdf", time: "11m ago" },
            { who: "System", action: "rotated", what: "API key · production", time: "1h ago" },
            { who: "Alex Kowalski", action: "invited", what: "leo@nebula.ai as Member", time: "3h ago" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-3">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500/30 to-sky-400/20 text-[10px] text-white/90">
                {a.who.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="min-w-0 flex-1 text-[12.5px]">
                <span className="text-white/85">{a.who}</span>
                <span className="text-white/40"> {a.action} </span>
                <span className="text-white/75">{a.what}</span>
              </div>
              <span className="text-[11px] text-white/40">{a.time}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function Models() {
  return (
    <div className="mt-8 space-y-3">
      {MODELS.map((m) => (
        <div
          key={m.id}
          className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15"
        >
          <div
            className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${m.accent} opacity-15 blur-2xl`}
          />
          <div className="relative flex items-center gap-4">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${m.accent} text-[#0A0A0B]`}
            >
              <m.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-white/95">{m.name}</span>
                {m.on ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-400/[0.08] px-2 py-0.5 text-[10px] text-emerald-300">
                    <span className="h-1 w-1 rounded-full bg-emerald-300" />
                    Enabled
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40">
                    Off
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-[11.5px] text-white/45">
                <span>Avg latency · <span className="font-mono text-white/70">{m.latency}</span></span>
                <span>Cost · <span className="font-mono text-white/70">{m.cost}</span></span>
              </div>
            </div>
            <ToggleSwitch on={m.on} />
            <button className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Team() {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <div className="grid grid-cols-[1fr_120px_120px_140px_40px] gap-4 border-b border-white/[0.05] px-5 py-3 text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
        <span>Member</span>
        <span>Role</span>
        <span>Status</span>
        <span>Usage</span>
        <span />
      </div>
      {TEAM.map((m, i) => (
        <div
          key={m.email}
          className={`group grid grid-cols-[1fr_120px_120px_140px_40px] items-center gap-4 px-5 py-3 transition hover:bg-white/[0.03] ${
            i === 0 ? "" : "border-t border-white/[0.04]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500/30 to-sky-400/20 text-[10.5px] text-white/90">
              {m.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] text-white/90">{m.name}</div>
              <div className="truncate text-[11px] text-white/40">{m.email}</div>
            </div>
          </div>
          <span className="text-[12px] text-white/70">{m.role}</span>
          <span className="flex items-center gap-1.5 text-[12px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                m.status === "active"
                  ? "bg-emerald-400"
                  : m.status === "idle"
                    ? "bg-amber-400"
                    : "bg-white/30"
              }`}
            />
            <span className="capitalize text-white/65">{m.status}</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400"
                style={{ width: `${m.usage}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-white/55">
              {m.usage}%
            </span>
          </div>
          <button className="opacity-0 transition group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4 text-white/40" />
          </button>
        </div>
      ))}
    </div>
  );
}

function System() {
  const rows = [
    { icon: Shield, title: "Single sign-on (SSO)", desc: "Enforce SAML or OIDC for all members", action: "Configure" },
    { icon: KeyRound, title: "API keys", desc: "3 active keys · last rotated 14 days ago", action: "Manage" },
    { icon: Database, title: "Data retention", desc: "Conversations kept for 90 days, then deleted", action: "Edit" },
    { icon: Bell, title: "Alerting", desc: "Email + Slack notifications on quota and anomalies", action: "Open" },
    { icon: Sparkles, title: "Custom system prompt", desc: "A workspace-wide instruction prepended to every chat", action: "Edit" },
  ];
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {rows.map((r) => (
        <button
          key={r.title}
          className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-400/20 text-violet-200">
            <r.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] text-white/95">{r.title}</div>
            <div className="text-[11.5px] text-white/45">{r.desc}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-white/55 transition group-hover:text-white">
            {r.action}
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </button>
      ))}
    </div>
  );
}

function KPI({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: any;
  tone: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-violet-500/15 to-sky-400/15 blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-white/30" />
      </div>
      <div
        className="mt-3 tabular-nums text-white/95"
        style={{ fontSize: 28, letterSpacing: "-0.01em" }}
      >
        {value}
      </div>
      <div className="text-[11px] text-emerald-300/80">{delta}</div>
    </motion.div>
  );
}

function ChartCard({
  title,
  sub,
  children,
  className = "",
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 ${className}`}
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[13.5px] text-white/90">{title}</div>
          <div className="text-[11px] text-white/40">{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  const [v, setV] = useState(on);
  return <Toggle checked={v} onChange={setV} />;
}
