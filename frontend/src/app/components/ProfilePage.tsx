import { useState } from "react";
import { motion } from "motion/react";
import { Toggle } from "./ui/Toggle";
import {
  Camera,
  Mail,
  Crown,
  KeyRound,
  Smartphone,
  Laptop,
  Globe2,
  Receipt,
  Download,
  Copy,
  Check,
  Plus,
  ChevronRight,
  Shield,
  LogOut,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export function ProfilePage({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [tab, setTab] = useState<"profile" | "billing" | "security" | "api">(
    "profile",
  );

  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 pt-10 pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] via-fuchsia-500/[0.04] to-sky-400/[0.08] p-6">
        <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="group relative h-20 w-20 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 blur-md opacity-70" />
            <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 text-[22px] text-[#0A0A0B]">
              AK
            </div>
            <button
              onClick={() => toast("Upload photo coming soon")}
              className="absolute -right-1 -bottom-1 grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-[#0E0E10] text-white/80 transition hover:text-white"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
              Account
            </div>
            <h1
              className="mt-1 text-white"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(34px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Alex Kowalski
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> alex@nebula.ai
              </span>
              <span className="text-white/15">·</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-2 py-0.5 text-[11px] text-violet-200">
                <Crown className="h-3 w-3" /> Pro · Workspace owner
              </span>
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              onClick={onOpenSettings}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12.5px] text-white/85 transition hover:bg-white/[0.08] sm:flex-none"
            >
              Open settings
            </button>
            <button
              onClick={() => toast.success("Signed out of this device")}
              title="Sign out"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
        {(["profile", "billing", "security", "api"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-lg px-3 py-1.5 text-[12px] capitalize transition ${
              tab === t ? "text-white" : "text-white/45 hover:text-white"
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="profile-tab"
                className="absolute inset-0 rounded-lg bg-white/[0.08]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{t === "api" ? "API" : t}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "profile" && <ProfileTab />}
        {tab === "billing" && <BillingTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "api" && <ApiTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const [name, setName] = useState("Alex Kowalski");
  const [bio, setBio] = useState(
    "Building Nebula. Previously product at Linear and design at Vercel.",
  );
  const [pronouns, setPronouns] = useState("they/them");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Identity" desc="How you appear to your workspace">
        <Field label="Display name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-white/95 outline-none transition focus:border-white/20"
          />
        </Field>
        <Field label="Pronouns">
          <input
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-white/95 outline-none transition focus:border-white/20"
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] leading-relaxed text-white/95 outline-none transition focus:border-white/20"
          />
        </Field>
        <button
          onClick={() => toast.success("Profile saved")}
          className="mt-1 rounded-lg bg-white px-3.5 py-1.5 text-[12.5px] text-[#0A0A0B] transition hover:bg-white/90"
        >
          Save changes
        </button>
      </Card>

      <Card title="Preferences" desc="Tune Nebula to how you work">
        <ToggleRow label="Daily digest email" desc="Summary of yesterday's activity" defaultOn />
        <ToggleRow label="Suggest follow-up prompts" desc="After each AI response" defaultOn />
        <ToggleRow label="Voice responses" desc="Speak AI replies aloud" />
        <ToggleRow label="Show token counts" desc="Per-message token usage" defaultOn />
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <div className="text-[12px] text-white/80">Default model</div>
          <div className="mt-0.5 text-[11px] text-white/45">
            Used when you start a new conversation
          </div>
          <button
            onClick={() => toast("Open the model picker to change default")}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-[#0E0E10] px-3 py-2 text-[12.5px] text-white/85 transition hover:bg-white/[0.04]"
          >
            <span className="inline-flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-violet-400 to-fuchsia-400">
                <Crown className="h-3 w-3 text-[#0A0A0B]" />
              </span>
              Nebula Opus 4.7
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          </button>
        </div>
      </Card>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] to-sky-400/[0.05] p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-violet-200/70 uppercase">
              Current plan
            </div>
            <div
              className="mt-1 text-white"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}
            >
              Nebula Pro · Workspace
            </div>
            <div className="mt-1 text-[12.5px] text-white/55">
              $20 / member / month · billed monthly · 24 active members
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast("Opening upgrade comparison")}
              className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-[12.5px] text-white/85 hover:bg-white/[0.08]"
            >
              Compare plans
            </button>
            <button
              onClick={() => toast.success("Subscription managed")}
              className="rounded-lg bg-white px-4 py-2 text-[12.5px] text-[#0A0A0B] hover:bg-white/90"
            >
              Manage
            </button>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-5">
          <Mini label="This month" value="$480.00" sub="24 × $20" />
          <Mini label="Tokens used" value="12.4M" sub="of 20M included" />
          <Mini label="Next invoice" value="14 Jun" sub="auto-renews" />
        </div>
      </div>

      <Card
        title="Payment method"
        desc="Charged automatically on each invoice date"
        action={
          <button
            onClick={() => toast("Open payment editor")}
            className="text-[12px] text-violet-300/80 hover:text-violet-200"
          >
            Update
          </button>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <div className="grid h-9 w-14 place-items-center rounded-md bg-gradient-to-br from-slate-200 to-slate-400 text-[10px] tracking-widest text-slate-900">
            VISA
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white/90">•••• •••• •••• 4242</div>
            <div className="text-[11px] text-white/45">Expires 09 / 28 · Alex Kowalski</div>
          </div>
          <CreditCard className="h-4 w-4 text-white/30" />
        </div>
      </Card>

      <Card title="Invoices" desc="The last six months">
        <div className="-mx-1">
          {[
            { d: "May 14, 2026", a: "$480.00", s: "Paid" },
            { d: "Apr 14, 2026", a: "$440.00", s: "Paid" },
            { d: "Mar 14, 2026", a: "$420.00", s: "Paid" },
            { d: "Feb 14, 2026", a: "$380.00", s: "Paid" },
          ].map((inv, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-3 text-[12.5px] ${
                i === 0 ? "" : "border-t border-white/[0.04]"
              }`}
            >
              <span className="flex items-center gap-2 text-white/75">
                <Receipt className="h-3.5 w-3.5 text-white/40" />
                {inv.d}
              </span>
              <span className="tabular-nums text-white/85">{inv.a}</span>
              <span className="text-[11px] text-emerald-300/80">{inv.s}</span>
              <button
                onClick={() => toast(`Downloading invoice ${inv.d}`)}
                className="text-white/40 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Password" desc="Last changed 42 days ago">
        <Field label="Current password">
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-white/95 outline-none focus:border-white/20"
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            placeholder="At least 12 characters"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-white/95 outline-none focus:border-white/20"
          />
        </Field>
        <button
          onClick={() => toast.success("Password updated")}
          className="mt-1 rounded-lg bg-white px-3.5 py-1.5 text-[12.5px] text-[#0A0A0B] hover:bg-white/90"
        >
          Update password
        </button>
      </Card>

      <Card
        title="Two-factor authentication"
        desc="Adds a second step at sign-in"
      >
        <div className="rounded-xl border border-emerald-300/15 bg-emerald-400/[0.04] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13px] text-white/90">Authenticator app</div>
                <div className="text-[11px] text-white/45">
                  Connected · 1Password
                </div>
              </div>
            </div>
            <button
              onClick={() => toast("Configure 2FA")}
              className="text-[12px] text-violet-300/80 hover:text-violet-200"
            >
              Reconfigure
            </button>
          </div>
        </div>
        <button
          onClick={() => toast("Add recovery code")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.01] py-2.5 text-[12.5px] text-white/55 hover:border-white/25 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add recovery codes
        </button>
      </Card>

      <Card title="Active sessions" desc="Devices currently signed in" className="lg:col-span-2">
        {[
          { device: "MacBook Pro · Chrome", where: "London, UK", when: "Active now", icon: Laptop, current: true },
          { device: "iPhone 15 · Nebula iOS", where: "London, UK", when: "2h ago", icon: Smartphone, current: false },
          { device: "Firefox · Berlin", where: "Berlin, DE", when: "3d ago", icon: Globe2, current: false },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-1 py-3 ${
              i === 0 ? "" : "border-t border-white/[0.04]"
            }`}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-white/75">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[13px] text-white/90">
                {s.device}
                {s.current && (
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-400/[0.08] px-2 py-0.5 text-[10px] text-emerald-300">
                    This device
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/45">
                {s.where} · {s.when}
              </div>
            </div>
            {!s.current && (
              <button
                onClick={() => toast.success("Session revoked")}
                className="text-[11.5px] text-rose-300/80 hover:text-rose-200"
              >
                Sign out
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function ApiTab() {
  const [keys, setKeys] = useState([
    { id: "k1", label: "Production · web", masked: "neb_live_·····7f4Q2", created: "14 May 2026" },
    { id: "k2", label: "Staging · iOS build", masked: "neb_test_·····K9aP1", created: "02 May 2026" },
  ]);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string) => {
    navigator.clipboard.writeText("neb_•••••••••••••");
    setCopied(id);
    toast.success("Key copied to clipboard");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <Card
        title="API keys"
        desc="Authenticate requests against the Nebula API"
        action={
          <button
            onClick={() => {
              setKeys((k) => [
                ...k,
                {
                  id: `k${Date.now()}`,
                  label: "New key",
                  masked: "neb_live_·····NEW9",
                  created: "Just now",
                },
              ]);
              toast.success("API key created — copy it now");
            }}
            className="rounded-md bg-white px-2.5 py-1 text-[11.5px] text-[#0A0A0B] hover:bg-white/90"
          >
            + New key
          </button>
        }
      >
        {keys.map((k, i) => (
          <div
            key={k.id}
            className={`flex items-center gap-4 px-1 py-3 ${
              i === 0 ? "" : "border-t border-white/[0.04]"
            }`}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-white/90">{k.label}</div>
              <div className="font-mono text-[11.5px] text-white/45">{k.masked}</div>
            </div>
            <span className="text-[11px] text-white/40">Created {k.created}</span>
            <button
              onClick={() => copy(k.id)}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/65 hover:text-white"
            >
              {copied === k.id ? (
                <Check className="h-3 w-3 text-emerald-300" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => {
                setKeys((ks) => ks.filter((x) => x.id !== k.id));
                toast.success("Key revoked");
              }}
              className="text-[11.5px] text-rose-300/80 hover:text-rose-200"
            >
              Revoke
            </button>
          </div>
        ))}
      </Card>

      <Card title="Webhooks" desc="POST events to your endpoint">
        <Field label="Endpoint URL">
          <input
            defaultValue="https://app.acme.com/api/nebula/webhook"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[12px] text-white/85 outline-none focus:border-white/20"
          />
        </Field>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["message.created", "thread.archived", "file.indexed", "quota.warning"].map(
            (e) => (
              <span
                key={e}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/70"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {e}
              </span>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  desc,
  action,
  className = "",
  children,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[13.5px] text-white/90">{title}</div>
          <div className="mt-0.5 text-[11.5px] text-white/45">{desc}</div>
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] tracking-[0.14em] text-white/40 uppercase">
        {label}
      </div>
      {children}
    </label>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-[10.5px] tracking-[0.16em] text-white/40 uppercase">
        {label}
      </div>
      <div className="mt-1 tabular-nums text-white/95" style={{ fontSize: 20 }}>
        {value}
      </div>
      <div className="text-[11px] text-white/45">{sub}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between border-t border-white/[0.04] py-3 first:border-t-0 first:pt-0">
      <div>
        <div className="text-[12.5px] text-white/90">{label}</div>
        <div className="mt-0.5 text-[11px] text-white/45">{desc}</div>
      </div>
      <Toggle checked={on} onChange={setOn} label={label} />
    </div>
  );
}
