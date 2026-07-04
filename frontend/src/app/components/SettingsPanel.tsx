import { motion, AnimatePresence } from "motion/react";
import { Toggle as PremiumToggle } from "./ui/Toggle";
import {
  X,
  User,
  Palette,
  Bell,
  Lock,
  Sparkles,
  FolderKanban,
  ShieldCheck,
  CreditCard,
  Keyboard,
  Info,
  ChevronRight,
  Search,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Monitor,
  Smartphone,
  Globe,
  Cpu,
  Github,
  Chrome,
  Mail,
  Key,
  Eye,
  EyeOff,
  Crown,
  Brain,
  Feather,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Activity,
  Database,
  Users,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SectionId =
  | "account"
  | "appearance"
  | "notifications"
  | "privacy"
  | "ai"
  | "workspace"
  | "admin"
  | "billing"
  | "shortcuts"
  | "about";

const SECTIONS: {
  id: SectionId;
  label: string;
  group: string;
  icon: any;
  hint: string;
}[] = [
  { id: "account", label: "Account", group: "Personal", icon: User, hint: "Profile, sessions, linked apps" },
  { id: "appearance", label: "Appearance", group: "Personal", icon: Palette, hint: "Theme, accent, density, motion" },
  { id: "notifications", label: "Notifications", group: "Personal", icon: Bell, hint: "Push, email, AI activity" },
  { id: "privacy", label: "Privacy & Security", group: "Personal", icon: Lock, hint: "History, devices, permissions" },
  { id: "ai", label: "AI Preferences", group: "Intelligence", icon: Sparkles, hint: "Models, memory, reasoning" },
  { id: "workspace", label: "Workspace", group: "Intelligence", icon: FolderKanban, hint: "Projects, knowledge, uploads" },
  { id: "admin", label: "Admin & System", group: "Organization", icon: ShieldCheck, hint: "Roles, limits, infrastructure" },
  { id: "billing", label: "Billing", group: "Organization", icon: CreditCard, hint: "Plan, invoices, credits" },
  { id: "shortcuts", label: "Shortcuts", group: "Productivity", icon: Keyboard, hint: "Keyboard map" },
  { id: "about", label: "About Nebula", group: "Productivity", icon: Info, hint: "Version, changelog, updates" },
];

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [section, setSection] = useState<SectionId>("account");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<SectionId[]>(["account"]);

  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof SECTIONS> = {};
    filtered.forEach((s) => {
      (g[s.group] ||= []).push(s);
    });
    return g;
  }, [filtered]);

  const go = (id: SectionId) => {
    setSection(id);
    setHistory((h) => (h[h.length - 1] === id ? h : [...h, id]));
  };

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full max-h-[860px] w-full max-w-[1180px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0B0D]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            {/* ambient halo */}
            <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-1/2 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-1/3 rounded-full bg-sky-400/10 blur-3xl" />

            {/* Sidebar */}
            <aside className="relative z-10 flex w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0A0A0C]/70">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                    Workspace
                  </div>
                  <h2
                    className="mt-0.5 text-white/95"
                    style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}
                  >
                    Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2">
                  <Search className="h-3.5 w-3.5 text-white/40" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search settings…"
                    className="flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-2.5 pb-4 [scrollbar-width:thin]">
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-3">
                    <div className="px-3 pt-2 pb-1.5 text-[9.5px] tracking-[0.24em] text-white/30 uppercase">
                      {group}
                    </div>
                    {items.map((s) => {
                      const active = s.id === section;
                      return (
                        <button
                          key={s.id}
                          onClick={() => go(s.id)}
                          className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                            active
                              ? "text-white"
                              : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="settings-active"
                              className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]"
                              transition={{ type: "spring", stiffness: 320, damping: 30 }}
                            />
                          )}
                          <s.icon className="relative h-4 w-4 opacity-80" />
                          <div className="relative min-w-0 flex-1">
                            <div className="text-[13px]">{s.label}</div>
                            <div className="truncate text-[10.5px] text-white/35">
                              {s.hint}
                            </div>
                          </div>
                          {active && (
                            <ChevronRight className="relative h-3.5 w-3.5 text-white/60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="border-t border-white/[0.05] p-3">
                <div className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-violet-500/[0.10] to-sky-400/[0.05] p-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-sky-400 text-[#0A0A0B]">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-white/95">Nebula Pro</div>
                    <div className="text-[10.5px] text-white/40">Renews 14 Jun</div>
                  </div>
                  <button
                    onClick={() => go("billing")}
                    className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-white/80 hover:bg-white/[0.04]"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="relative flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-white/[0.06] px-8 py-4">
                <div className="flex items-center gap-2 text-[12px] text-white/45">
                  <span>Settings</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white/85">{current.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="relative flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-3xl px-8 py-8"
                  >
                    <PageHeader
                      icon={current.icon}
                      label={current.label}
                      hint={current.hint}
                    />
                    {section === "account" && <AccountPage />}
                    {section === "appearance" && <AppearancePage />}
                    {section === "notifications" && <NotificationsPage />}
                    {section === "privacy" && <PrivacyPage />}
                    {section === "ai" && <AIPage />}
                    {section === "workspace" && <WorkspacePage />}
                    {section === "admin" && <AdminSettingsPage />}
                    {section === "billing" && <BillingPage />}
                    {section === "shortcuts" && <ShortcutsPage />}
                    {section === "about" && <AboutPage />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────── Shared primitives ───────────── */

function PageHeader({ icon: Icon, label, hint }: { icon: any; label: string; hint: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
        <Icon className="h-5 w-5 text-white/85" />
      </div>
      <div>
        <h1
          className="text-white/95"
          style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, lineHeight: 1 }}
        >
          {label}
        </h1>
        <div className="mt-1 text-[12.5px] text-white/45">{hint}</div>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  children,
  action,
}: {
  title?: string;
  desc?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div>
            {title && <div className="text-[13px] text-white/90">{title}</div>}
            {desc && <div className="mt-0.5 text-[12px] text-white/40">{desc}</div>}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 pt-1 pb-4">{children}</div>
    </section>
  );
}

function Row({
  title,
  desc,
  control,
}: {
  title: string;
  desc?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/[0.04] py-3.5 first:border-t-0 first:pt-1">
      <div className="min-w-0">
        <div className="text-[13px] text-white/90">{title}</div>
        {desc && <div className="mt-0.5 text-[11.5px] text-white/40">{desc}</div>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return <PremiumToggle checked={on} onChange={setOn} />;
}

function Field({
  label,
  defaultValue,
  type = "text",
  hint,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  hint?: string;
}) {
  const [v, setV] = useState(defaultValue ?? "");
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] tracking-wider text-white/45 uppercase">
        {label}
      </div>
      <div className="relative">
        <input
          type={isPwd && !show ? "password" : "text"}
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white/95 outline-none transition focus:border-violet-400/40 focus:bg-white/[0.04]"
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {hint && <div className="mt-1 text-[11px] text-white/35">{hint}</div>}
    </label>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`relative rounded-md px-3 py-1.5 text-[12px] transition ${
            value === o.id ? "text-white" : "text-white/50 hover:text-white"
          }`}
        >
          {value === o.id && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.id).join("-")}`}
              className="absolute inset-0 rounded-md bg-white/[0.08]"
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3.5 py-2 text-[12.5px] text-[#0A0A0B] transition hover:brightness-110"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-[12px] transition ${
        danger
          ? "border-rose-400/30 text-rose-300 hover:bg-rose-500/[0.08]"
          : "border-white/[0.10] text-white/80 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────── Pages ───────────── */

function AccountPage() {
  return (
    <>
      <Card title="Profile" desc="How you appear across Nebula." action={<PrimaryBtn onClick={() => toast.success("Profile saved")}>Save</PrimaryBtn>}>
        <div className="flex items-center gap-4 pt-1 pb-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-[#0A0A0B]" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>
            AS
          </div>
          <div className="flex gap-2">
            <GhostBtn onClick={() => toast("Upload coming soon")}>Upload photo</GhostBtn>
            <GhostBtn danger>Remove</GhostBtn>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Display name" defaultValue="Alex Stratos" />
          <Field label="Username" defaultValue="@alex" hint="nebula.app/@alex" />
          <Field label="Email" defaultValue="alex@nebula.app" />
          <Field label="Title" defaultValue="Founding designer" />
        </div>
      </Card>

      <Card title="Password" desc="Use a strong, unique password.">
        <div className="grid grid-cols-2 gap-4 pb-3">
          <Field label="Current password" type="password" defaultValue="••••••••" />
          <Field label="New password" type="password" />
        </div>
        <Row
          title="Two-factor authentication"
          desc="Enabled via authenticator app · last used 2 days ago"
          control={<Toggle defaultOn />}
        />
      </Card>

      <Card title="Linked accounts" desc="Sign in with these accounts.">
        {[
          { name: "Google", icon: Chrome, sub: "alex@gmail.com", linked: true },
          { name: "GitHub", icon: Github, sub: "@alexstratos", linked: true },
          { name: "Apple", icon: Globe, sub: "Not connected", linked: false },
        ].map((a) => (
          <Row
            key={a.name}
            title={a.name}
            desc={a.sub}
            control={
              a.linked ? (
                <GhostBtn danger>Disconnect</GhostBtn>
              ) : (
                <GhostBtn>Connect</GhostBtn>
              )
            }
          />
        ))}
      </Card>

      <Card title="Active sessions" desc="Devices currently signed in.">
        {[
          { d: "MacBook Pro 16″", l: "San Francisco · current", icon: Monitor, current: true },
          { d: "iPhone 15", l: "San Francisco · 2 hours ago", icon: Smartphone },
          { d: "Chrome on Windows", l: "Brooklyn · 4 days ago", icon: Globe },
        ].map((s) => (
          <Row
            key={s.d}
            title={s.d}
            desc={s.l}
            control={
              s.current ? (
                <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-[10.5px] text-emerald-300">
                  Active
                </span>
              ) : (
                <GhostBtn danger onClick={() => toast(`${s.d} signed out`)}>Sign out</GhostBtn>
              )
            }
          />
        ))}
      </Card>
    </>
  );
}

function AppearancePage() {
  const [theme, setTheme] = useState("midnight");
  const [accent, setAccent] = useState(0);
  const [density, setDensity] = useState<"comfortable" | "cozy" | "compact">("comfortable");
  const [size, setSize] = useState(15);

  return (
    <>
      <Card title="Theme preset" desc="Surface tone and ambient hue.">
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { id: "midnight", label: "Midnight", bg: "from-[#0a0a0c] to-[#1a1530]" },
            { id: "void", label: "Void", bg: "from-black to-[#0a0a0a]" },
            { id: "aurora", label: "Aurora", bg: "from-[#0c1424] to-[#1a0a2a]" },
            { id: "dusk", label: "Dusk", bg: "from-[#1a0f1f] to-[#0a0a0c]" },
            { id: "noir", label: "Noir", bg: "from-[#0d0d10] to-[#15151a]" },
            { id: "ember", label: "Ember", bg: "from-[#1a0e0a] to-[#0a0a0c]" },
          ].map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
                  active ? "border-white/30 bg-white/[0.04]" : "border-white/[0.06] hover:border-white/15"
                }`}
              >
                <div className={`mb-2 h-20 rounded-lg bg-gradient-to-br ${t.bg}`}>
                  <div className="h-full w-full rounded-lg bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.25),transparent_60%)]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/85">{t.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Accent color" desc="Tints highlights, focus rings, and gradients.">
        <div className="flex flex-wrap gap-3 pt-1">
          {[
            "from-violet-500 to-sky-400",
            "from-emerald-400 to-cyan-300",
            "from-amber-300 to-rose-400",
            "from-fuchsia-400 to-indigo-500",
            "from-rose-400 to-orange-300",
            "from-teal-300 to-emerald-400",
            "from-white to-white/40",
          ].map((c, i) => (
            <button
              key={i}
              onClick={() => setAccent(i)}
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${c} transition ${
                accent === i ? "ring-2 ring-white/60 ring-offset-2 ring-offset-[#0B0B0D]" : ""
              }`}
            />
          ))}
        </div>
      </Card>

      <Card title="Density" desc="How tightly content is packed.">
        <Segmented
          value={density}
          onChange={setDensity}
          options={[
            { id: "comfortable", label: "Comfortable" },
            { id: "cozy", label: "Cozy" },
            { id: "compact", label: "Compact" },
          ]}
        />
      </Card>

      <Card title="Motion" desc="Ambient animations and transitions.">
        <Row title="Reduced motion" desc="Minimize background motion and parallax" control={<Toggle />} />
        <Row title="Typing animation" desc="Animate AI responses character-by-character" control={<Toggle defaultOn />} />
        <Row title="Ambient gradients" desc="Slow-shifting halos across surfaces" control={<Toggle defaultOn />} />
      </Card>

      <Card title="Typography" desc="Reading comfort across long conversations.">
        <Row title="Display family" desc="Headings & hero moments" control={
          <Segmented value="serif" onChange={() => {}} options={[
            { id: "serif", label: "Instrument" },
            { id: "sans", label: "Inter" },
          ]} />
        } />
        <div className="border-t border-white/[0.04] py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-white/90">Body size</div>
              <div className="mt-0.5 text-[11.5px] text-white/40">{size}px · {size <= 14 ? "Compact" : size >= 16 ? "Large" : "Default"}</div>
            </div>
            <div className="tabular-nums text-[12px] text-white/60">{size}px</div>
          </div>
          <input
            type="range"
            min={13}
            max={18}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="mt-3 w-full accent-violet-400"
          />
        </div>
        <Row title="Monospace ligatures" desc="Stylistic ligatures in code blocks" control={<Toggle defaultOn />} />
      </Card>
    </>
  );
}

function NotificationsPage() {
  return (
    <>
      <Card title="Push notifications" desc="Delivered to your devices.">
        <Row title="Mentions & replies" desc="Anyone responds to your thread" control={<Toggle defaultOn />} />
        <Row title="Long-running task complete" desc="When background reasoning finishes" control={<Toggle defaultOn />} />
        <Row title="Daily digest" desc="Summary of yesterday's activity at 9:00 AM" control={<Toggle />} />
      </Card>

      <Card title="Email alerts" desc="alex@nebula.app">
        <Row title="Weekly product updates" control={<Toggle defaultOn />} />
        <Row title="Security alerts" desc="New sign-ins, password changes" control={<Toggle defaultOn />} />
        <Row title="Billing receipts" control={<Toggle defaultOn />} />
        <Row title="Research previews" desc="Invite-only beta releases" control={<Toggle />} />
      </Card>

      <Card title="AI activity" desc="Subtle in-app cues from your assistant.">
        <Row title="Show thinking indicator" control={<Toggle defaultOn />} />
        <Row title="Sound on completion" control={<Toggle />} />
        <Row title="Surface citations panel automatically" control={<Toggle defaultOn />} />
      </Card>

      <Card title="Workspace updates" desc="Activity from people you share with.">
        <Row title="New comments in shared threads" control={<Toggle defaultOn />} />
        <Row title="Knowledge files reindexed" control={<Toggle />} />
        <Row title="Admin announcements" control={<Toggle defaultOn />} />
      </Card>

      <Card title="Quiet hours" desc="Pause non-critical notifications.">
        <div className="grid grid-cols-2 gap-4 pt-1">
          <Field label="Start" defaultValue="22:00" />
          <Field label="End" defaultValue="08:00" />
        </div>
      </Card>
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <Card title="Chat history & training" desc="Control how conversations are stored and used.">
        <Row title="Save chat history" desc="Threads remain available across devices" control={<Toggle defaultOn />} />
        <Row title="Improve models with your chats" desc="Anonymized samples used for training" control={<Toggle />} />
        <Row title="Auto-delete threads after 30 days" control={<Toggle />} />
      </Card>

      <Card title="Data controls" desc="Export, archive, or remove your data.">
        <Row
          title="Export all data"
          desc="Receive a downloadable archive within 24 hours"
          control={<GhostBtn onClick={() => toast.success("Export requested — we'll email you")}><Download className="mr-1.5 inline h-3 w-3" />Export</GhostBtn>}
        />
        <Row
          title="Archive inactive threads"
          desc="Move threads older than 90 days to archive"
          control={<GhostBtn>Run now</GhostBtn>}
        />
        <Row
          title="Delete account"
          desc="Permanently remove account, threads and memory"
          control={<GhostBtn danger onClick={() => toast.error("This action is permanent")}>Delete…</GhostBtn>}
        />
      </Card>

      <Card title="Permissions" desc="What Nebula can access on your behalf.">
        <Row title="Camera" desc="Used for screen capture sources" control={<Toggle />} />
        <Row title="Microphone" desc="Voice input & dictation" control={<Toggle defaultOn />} />
        <Row title="Clipboard" desc="Paste detection & smart actions" control={<Toggle defaultOn />} />
        <Row title="Location" desc="Localize answers and timezones" control={<Toggle />} />
      </Card>

      <Card title="Device sessions" desc="Force sign-out untrusted devices.">
        {[
          { d: "MacBook Pro 16″", l: "San Francisco · this device", current: true },
          { d: "iPhone 15", l: "San Francisco · 2 hours ago" },
          { d: "iPad Pro", l: "Brooklyn · 6 days ago" },
        ].map((s) => (
          <Row
            key={s.d}
            title={s.d}
            desc={s.l}
            control={
              s.current ? (
                <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-[10.5px] text-emerald-300">Active</span>
              ) : (
                <GhostBtn danger>Revoke</GhostBtn>
              )
            }
          />
        ))}
      </Card>

      <Card title="Security preferences" desc="Hardening for your account.">
        <Row title="Require 2FA for new sign-ins" control={<Toggle defaultOn />} />
        <Row title="Block sign-in from new countries" control={<Toggle />} />
        <Row title="Recovery codes" desc="10 unused codes" control={<GhostBtn>Regenerate</GhostBtn>} />
      </Card>
    </>
  );
}

function AIPage() {
  const [model, setModel] = useState("nebula-opus");
  const [temp, setTemp] = useState(0.6);
  const [reasoning, setReasoning] = useState<"swift" | "balanced" | "deep">("balanced");
  const [system, setSystem] = useState(
    "You are Nebula, a thoughtful assistant. Default to clear, structured prose. Cite sources when reasoning across documents."
  );

  return (
    <>
      <Card title="Default model" desc="Used for new conversations.">
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            { id: "nebula-opus", name: "Nebula Opus 4.7", sub: "Reasoning · 1M ctx", icon: Crown },
            { id: "nebula-sonnet", name: "Nebula Sonnet 4.6", sub: "Balanced · fast", icon: Brain },
            { id: "nebula-haiku", name: "Nebula Haiku 4.5", sub: "Quick replies", icon: Feather },
            { id: "nebula-flash", name: "Nebula Flash", sub: "Real-time", icon: Zap },
          ].map((m) => {
            const active = model === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  active ? "border-violet-400/40 bg-violet-500/[0.05]" : "border-white/[0.06] hover:bg-white/[0.02]"
                }`}
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-400/20 text-violet-200">
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-white/95">{m.name}</div>
                  <div className="text-[11px] text-white/45">{m.sub}</div>
                </div>
                {active && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="AI personality" desc="Voice and tone defaults.">
        <Row title="Personality preset" control={
          <Segmented value="thoughtful" onChange={() => {}} options={[
            { id: "concise", label: "Concise" },
            { id: "thoughtful", label: "Thoughtful" },
            { id: "playful", label: "Playful" },
          ]} />
        } />
        <Row title="Address you as" control={<Field label="" defaultValue="Alex" />} />
      </Card>

      <Card title="System prompt" desc="Always prepended to your conversations.">
        <textarea
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-[13px] leading-relaxed text-white/90 outline-none focus:border-violet-400/40"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
          <span>{system.length} / 4,000 characters</span>
          <button className="text-violet-300/80 hover:text-violet-200" onClick={() => toast.success("System prompt saved")}>
            Save changes
          </button>
        </div>
      </Card>

      <Card title="Memory" desc="What Nebula remembers across sessions.">
        <Row title="Long-term memory" desc="Recall facts you share between chats" control={<Toggle defaultOn />} />
        <Row title="Cross-thread context" desc="Reference recent threads when relevant" control={<Toggle defaultOn />} />
        <Row title="Forget after each chat" desc="Discard short-term context on close" control={<Toggle />} />
        <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="text-[12px] text-white/60">42 stored memories · 3.2 KB</div>
          <GhostBtn onClick={() => toast("Opening memory editor")}>Manage memories</GhostBtn>
        </div>
      </Card>

      <Card title="Reasoning preferences" desc="Trade-off between speed and depth.">
        <Row title="Mode" control={
          <Segmented
            value={reasoning}
            onChange={setReasoning}
            options={[
              { id: "swift", label: "Swift" },
              { id: "balanced", label: "Balanced" },
              { id: "deep", label: "Deep" },
            ]}
          />
        } />
        <div className="border-t border-white/[0.04] py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-white/90">Temperature</div>
              <div className="mt-0.5 text-[11.5px] text-white/40">
                Lower = focused · Higher = exploratory
              </div>
            </div>
            <div className="tabular-nums text-[12px] text-white/60">{temp.toFixed(2)}</div>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            className="mt-3 w-full accent-violet-400"
          />
        </div>
        <Row title="Show reasoning steps" desc="Reveal intermediate thinking" control={<Toggle defaultOn />} />
      </Card>
    </>
  );
}

function WorkspacePage() {
  return (
    <>
      <Card title="Workspace" desc="Shared with your team.">
        <div className="grid grid-cols-2 gap-4 pt-1">
          <Field label="Workspace name" defaultValue="Stratos Studio" />
          <Field label="Slug" defaultValue="stratos" hint="nebula.app/stratos" />
        </div>
      </Card>

      <Card title="Knowledge storage" desc="Where indexed files live.">
        <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between text-[12px] text-white/70">
            <span>3.4 GB of 25 GB used</span>
            <span className="text-white/40">14% · 612 files</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full w-[14%] rounded-full bg-gradient-to-r from-violet-500 to-sky-400" />
          </div>
        </div>
        <Row title="Auto-index uploads" desc="New files vectorized on arrival" control={<Toggle defaultOn />} />
        <Row title="OCR scanned PDFs" control={<Toggle defaultOn />} />
        <Row title="Embedding model" control={
          <Segmented value="nebula" onChange={() => {}} options={[
            { id: "nebula", label: "Nebula" },
            { id: "compact", label: "Compact" },
          ]} />
        } />
      </Card>

      <Card title="Upload management" desc="Defaults applied to new files.">
        <Row title="Max file size" desc="Per upload" control={<Field label="" defaultValue="50 MB" />} />
        <Row title="Allowed types" desc="PDF, DOCX, MD, CSV, code" control={<GhostBtn>Edit</GhostBtn>} />
        <Row title="Quarantine new uploads" desc="Review before indexing" control={<Toggle />} />
      </Card>

      <Card
        title="Projects"
        desc="Group threads, files, and memory."
        action={<PrimaryBtn onClick={() => toast.success("Project created")}><Plus className="mr-1 inline h-3 w-3" />New project</PrimaryBtn>}
      >
        {[
          { n: "Checkout refactor", c: "12 threads · 8 files", color: "from-violet-500 to-fuchsia-400" },
          { n: "Series-B narrative", c: "5 threads · 14 files", color: "from-sky-400 to-cyan-300" },
          { n: "Brand voice", c: "3 threads · 22 files", color: "from-amber-300 to-rose-400" },
        ].map((p) => (
          <div key={p.n} className="flex items-center gap-3 border-t border-white/[0.04] py-3 first:border-t-0">
            <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${p.color}`} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-white/90">{p.n}</div>
              <div className="text-[11.5px] text-white/40">{p.c}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30" />
          </div>
        ))}
      </Card>
    </>
  );
}

function AdminSettingsPage() {
  return (
    <>
      <Card title="User roles" desc="Permissions across the workspace.">
        {[
          { r: "Owner", c: "Alex Stratos", n: 1 },
          { r: "Admin", c: "3 members", n: 3 },
          { r: "Member", c: "18 members", n: 18 },
          { r: "Guest", c: "5 collaborators", n: 5 },
        ].map((r) => (
          <Row
            key={r.r}
            title={r.r}
            desc={r.c}
            control={<GhostBtn>Manage</GhostBtn>}
          />
        ))}
        <div className="mt-3 flex justify-end">
          <PrimaryBtn onClick={() => toast.success("Invitation sent")}><Users className="mr-1.5 inline h-3 w-3" />Invite people</PrimaryBtn>
        </div>
      </Card>

      <Card title="Model access" desc="What teammates can run.">
        <Row title="Nebula Opus 4.7" desc="Full org · ~$0.018 / 1K out" control={<Toggle defaultOn />} />
        <Row title="Nebula Sonnet 4.6" control={<Toggle defaultOn />} />
        <Row title="Nebula Haiku 4.5" control={<Toggle defaultOn />} />
        <Row title="Nebula Flash" desc="Beta · usage-capped" control={<Toggle />} />
      </Card>

      <Card title="Usage limits" desc="Soft caps with email alerts.">
        <Row title="Tokens / member / day" control={<Field label="" defaultValue="250,000" />} />
        <Row title="Files / member" control={<Field label="" defaultValue="200" />} />
        <Row title="Hard stop at limit" desc="Block instead of warning" control={<Toggle />} />
      </Card>

      <Card title="Analytics & retention" desc="What data we keep.">
        <Row title="Audit log retention" control={
          <Segmented value="90" onChange={() => {}} options={[
            { id: "30", label: "30d" },
            { id: "90", label: "90d" },
            { id: "365", label: "1y" },
          ]} />
        } />
        <Row title="Share anonymized analytics" control={<Toggle defaultOn />} />
      </Card>

      <Card title="System health" desc="All systems nominal.">
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { l: "API", v: "Healthy", dot: "bg-emerald-400" },
            { l: "Inference", v: "Healthy", dot: "bg-emerald-400" },
            { l: "Index", v: "Degraded", dot: "bg-amber-400" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-white/40 uppercase">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.l}
              </div>
              <div className="mt-1 text-[13px] text-white/90">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-3">
          <div className="flex items-center gap-2 text-[12px] text-amber-200/90">
            <AlertTriangle className="h-3.5 w-3.5" />
            Embeddings backlog: 412 files queued
          </div>
          <GhostBtn onClick={() => toast("Restarting workers…")}>
            <RefreshCw className="mr-1.5 inline h-3 w-3" />Retry
          </GhostBtn>
        </div>
      </Card>

      <Card title="Infrastructure" desc="Region and routing.">
        <Row title="Primary region" control={
          <Segmented value="us-west" onChange={() => {}} options={[
            { id: "us-west", label: "US West" },
            { id: "eu", label: "EU" },
            { id: "ap", label: "APAC" },
          ]} />
        } />
        <Row title="VPC peering" desc="Private connectivity from your cloud" control={<GhostBtn>Configure</GhostBtn>} />
        <Row title="Custom domain" desc="settings.stratos.app" control={<GhostBtn>Verify</GhostBtn>} />
      </Card>
    </>
  );
}

function BillingPage() {
  const [plan, setPlan] = useState("pro");
  return (
    <>
      <Card title="Current plan" desc="Renews 14 Jun 2026.">
        <div className="flex items-center justify-between rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.1] to-sky-400/[0.05] p-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-300" />
              <span className="text-white/95">Nebula Pro</span>
            </div>
            <div className="mt-1 text-[12px] text-white/60">
              $20 / month · billed annually
            </div>
          </div>
          <div className="text-right">
            <div className="tabular-nums text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>
              $240
            </div>
            <div className="text-[10.5px] text-white/40">/ year</div>
          </div>
        </div>
      </Card>

      <Card title="Plans" desc="Switch anytime; prorated to the day.">
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { id: "free", name: "Free", price: "$0", perks: ["Sonnet & Haiku", "20 msg / day", "Local memory"] },
            { id: "pro", name: "Pro", price: "$20", perks: ["All models", "Long memory", "Knowledge base"] },
            { id: "team", name: "Team", price: "$40", perks: ["Pro features", "Shared workspace", "Admin controls"] },
          ].map((p) => {
            const active = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  active ? "border-violet-400/40 bg-violet-500/[0.05]" : "border-white/[0.06] hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-white/95">{p.name}</span>
                  {active && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="mt-2 tabular-nums text-white/90" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24 }}>
                  {p.price}<span className="text-[11px] text-white/40"> /mo</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {p.perks.map((x) => (
                    <li key={x} className="flex items-center gap-1.5 text-[11.5px] text-white/60">
                      <Check className="h-3 w-3 text-emerald-400/80" /> {x}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <GhostBtn>Compare features</GhostBtn>
          <PrimaryBtn onClick={() => toast.success("Switched to " + plan)}>Confirm change <ArrowUpRight className="ml-1 inline h-3 w-3" /></PrimaryBtn>
        </div>
      </Card>

      <Card title="Usage this cycle" desc="1 May – 1 Jun">
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { l: "Tokens", v: "1.92M", s: "of 5M" },
            { l: "Files indexed", v: "612", s: "of 2,000" },
            { l: "Credits", v: "$14.20", s: "remaining" },
          ].map((u) => (
            <div key={u.l} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[10px] tracking-[0.18em] text-white/40 uppercase">{u.l}</div>
              <div className="mt-1 tabular-nums text-[18px] text-white/95">{u.v}</div>
              <div className="text-[11px] text-white/40">{u.s}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Payment method">
        <Row
          title="Visa ending 4242"
          desc="Expires 09 / 2028"
          control={<GhostBtn>Update</GhostBtn>}
        />
        <Row
          title="Backup card"
          desc="Add a fallback for failed charges"
          control={<GhostBtn><Plus className="mr-1 inline h-3 w-3" />Add card</GhostBtn>}
        />
        <Row
          title="Billing email"
          desc="finance@stratos.studio"
          control={<GhostBtn>Edit</GhostBtn>}
        />
      </Card>

      <Card title="Invoices">
        {[
          { d: "May 2026", a: "$20.00", s: "Paid" },
          { d: "Apr 2026", a: "$20.00", s: "Paid" },
          { d: "Mar 2026", a: "$20.00", s: "Paid" },
        ].map((i) => (
          <Row
            key={i.d}
            title={i.d}
            desc={`Nebula Pro · ${i.a}`}
            control={
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-[10.5px] text-emerald-300">{i.s}</span>
                <GhostBtn><Download className="inline h-3 w-3" /></GhostBtn>
              </div>
            }
          />
        ))}
      </Card>
    </>
  );
}

const SHORTCUTS = [
  { g: "Navigation", items: [
    { k: ["⌘", "K"], l: "Open command palette" },
    { k: ["⌘", "N"], l: "Start new conversation" },
    { k: ["⌘", "/"], l: "Toggle details panel" },
    { k: ["⌘", ","], l: "Open settings" },
    { k: ["⌘", "B"], l: "Toggle sidebar" },
  ]},
  { g: "Composing", items: [
    { k: ["⏎"], l: "Send message" },
    { k: ["⇧", "⏎"], l: "New line" },
    { k: ["⌘", "⏎"], l: "Send with deep reasoning" },
    { k: ["⌘", "U"], l: "Attach files" },
    { k: ["⌘", "L"], l: "Toggle web search" },
  ]},
  { g: "Threads", items: [
    { k: ["⌘", "P"], l: "Pin / unpin thread" },
    { k: ["⌘", "E"], l: "Archive thread" },
    { k: ["⌘", "⇧", "C"], l: "Copy last reply" },
    { k: ["⌘", "⇧", "M"], l: "Switch model" },
  ]},
];

function ShortcutsPage() {
  return (
    <>
      <Card title="Keyboard map" desc="Mac shortcuts shown. Use Ctrl on Windows.">
        {SHORTCUTS.map((g) => (
          <div key={g.g} className="border-t border-white/[0.04] py-4 first:border-t-0 first:pt-1">
            <div className="mb-2 text-[10px] tracking-[0.22em] text-white/35 uppercase">{g.g}</div>
            <div className="grid grid-cols-1 gap-1.5">
              {g.items.map((s) => (
                <div key={s.l} className="flex items-center justify-between rounded-md px-1 py-1.5 hover:bg-white/[0.02]">
                  <span className="text-[12.5px] text-white/85">{s.l}</span>
                  <span className="flex items-center gap-1">
                    {s.k.map((kk, i) => (
                      <kbd key={i} className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] tracking-wider text-white/70">
                        {kk}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Productivity">
        <Row title="Enable Vim-style navigation" desc="j/k between messages, gg to top" control={<Toggle />} />
        <Row title="Quick switcher on Tab" desc="Cycle between recent threads" control={<Toggle defaultOn />} />
        <Row title="Show shortcut hints in toolbar" control={<Toggle defaultOn />} />
      </Card>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <Card>
        <div className="flex items-center gap-5 py-2">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-400 text-[#0A0A0B]">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="text-white/95" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, lineHeight: 1 }}>
              Nebula
            </div>
            <div className="mt-1 text-[12px] text-white/50">
              Version 4.7.2 · Build 2026.06.02
            </div>
          </div>
          <PrimaryBtn onClick={() => toast.success("You're on the latest version")}>
            <RefreshCw className="mr-1.5 inline h-3 w-3" />Check for updates
          </PrimaryBtn>
        </div>
      </Card>

      <Card title="Update channel" desc="Choose how often you receive new versions.">
        <Row title="Channel" control={
          <Segmented value="stable" onChange={() => {}} options={[
            { id: "stable", label: "Stable" },
            { id: "beta", label: "Beta" },
            { id: "canary", label: "Canary" },
          ]} />
        } />
        <Row title="Auto-install" desc="Apply updates on next restart" control={<Toggle defaultOn />} />
      </Card>

      <Card title="What's new" desc="Recent highlights.">
        {[
          { v: "4.7.2", d: "Faster long-context recall · sharper citation panel", t: "Today" },
          { v: "4.7.0", d: "Nebula Opus reasoning upgrade · new ambient theme", t: "12 May" },
          { v: "4.6.5", d: "Knowledge OCR for scanned PDFs · admin audit log", t: "28 Apr" },
        ].map((x) => (
          <div key={x.v} className="flex items-start gap-3 border-t border-white/[0.04] py-3 first:border-t-0 first:pt-1">
            <span className="mt-0.5 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10.5px] tabular-nums text-white/70">
              {x.v}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-white/85">{x.d}</div>
              <div className="text-[11px] text-white/40">{x.t}</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-white/30" />
          </div>
        ))}
      </Card>

      <Card title="System Information" desc="Diagnostic details for this Nebula installation.">
        <Row title="Environment" desc="Development (Local)" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">Active</span>} />
        <Row title="Active AI Providers" desc="Google Gemini, Anthropic Opus, OpenAI" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">3 Connected</span>} />
        <Row title="Backend Stack" desc="Node.js 20, NestJS 10, TypeScript" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">v10.3.1</span>} />
        <Row title="Frontend Stack" desc="React 18, Vite, Tailwind CSS, Motion" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">v18.3.1</span>} />
        <Row title="Database Stack" desc="PostgreSQL 16 via Prisma ORM" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">v5.12.0</span>} />
        <Row title="Vector Database" desc="Qdrant Local In-Memory Storage" control={<span className="text-white/60 text-[11px] uppercase tracking-wider">v1.8.0</span>} />
        <Row title="Roadmap" desc="View planned upcoming features" control={<GhostBtn>View <ExternalLink className="ml-1 inline h-3 w-3" /></GhostBtn>} />
        <Row title="License" desc="Nebula Commercial License" control={<span className="text-emerald-400/80 text-[11px] uppercase tracking-wider">Valid</span>} />
      </Card>

      <Card title="Resources">
        <Row title="Documentation" control={<GhostBtn>Open <ExternalLink className="ml-1 inline h-3 w-3" /></GhostBtn>} />
        <Row title="Changelog" control={<GhostBtn>Open <ExternalLink className="ml-1 inline h-3 w-3" /></GhostBtn>} />
        <Row title="Status page" desc="status.nebula.app" control={<GhostBtn>Open <ExternalLink className="ml-1 inline h-3 w-3" /></GhostBtn>} />
        <Row title="Contact support" desc="Reply within a few hours" control={<GhostBtn><Mail className="mr-1 inline h-3 w-3" />Email</GhostBtn>} />
      </Card>

      <div className="mt-4 text-center text-[11px] text-white/30">
        © 2026 Nebula Labs · Made with care.
      </div>
    </>
  );
}
