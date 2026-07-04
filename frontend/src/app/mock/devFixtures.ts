export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  members: { name: string; initials: string; tone: string }[];
  owner: string;
  updatedAt: string;
  status: "active" | "review" | "archived";
  threads: number;
  files: number;
  tasks: { done: number; total: number };
  notes: number;
  pinned?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "p-checkout",
    name: "Checkout refactor",
    description: "Decompose the 800-line checkout into step-scoped hooks and a parent state machine.",
    color: "from-violet-500 to-fuchsia-400",
    emoji: "◆",
    owner: "Alex Stratos",
    updatedAt: "2 min ago",
    status: "active",
    threads: 12,
    files: 8,
    tasks: { done: 18, total: 27 },
    notes: 5,
    pinned: true,
    members: [
      { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
      { name: "Mira Chen", initials: "MC", tone: "from-emerald-400 to-cyan-300" },
      { name: "Jordan Reed", initials: "JR", tone: "from-amber-300 to-rose-400" },
    ],
  },
  {
    id: "p-series-b",
    name: "Series-B narrative",
    description: "Investor deck story, metrics canon, and Q&A war-room.",
    color: "from-sky-400 to-cyan-300",
    emoji: "✦",
    owner: "Alex Stratos",
    updatedAt: "1 hour ago",
    status: "review",
    threads: 5,
    files: 14,
    tasks: { done: 9, total: 12 },
    notes: 11,
    pinned: true,
    members: [
      { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
      { name: "Priya Nair", initials: "PN", tone: "from-fuchsia-400 to-indigo-500" },
    ],
  },
  {
    id: "p-brand",
    name: "Brand voice",
    description: "Tone of voice exploration across surfaces — product, marketing, support.",
    color: "from-amber-300 to-rose-400",
    emoji: "❋",
    owner: "Mira Chen",
    updatedAt: "Yesterday",
    status: "active",
    threads: 3,
    files: 22,
    tasks: { done: 4, total: 10 },
    notes: 8,
    members: [
      { name: "Mira Chen", initials: "MC", tone: "from-emerald-400 to-cyan-300" },
      { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
      { name: "Sam Okafor", initials: "SO", tone: "from-rose-400 to-orange-300" },
      { name: "Lin Park", initials: "LP", tone: "from-teal-300 to-emerald-400" },
    ],
  },
  {
    id: "p-kyoto",
    name: "Kyoto itinerary",
    description: "5-day research trip planning with restaurants, ryokans, and ambient routes.",
    color: "from-emerald-400 to-cyan-300",
    emoji: "❀",
    owner: "Alex Stratos",
    updatedAt: "Mon",
    status: "active",
    threads: 4,
    files: 6,
    tasks: { done: 7, total: 9 },
    notes: 3,
    members: [
      { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
    ],
  },
  {
    id: "p-onboarding",
    name: "Onboarding copy",
    description: "Rewrite of the first-run experience for new workspaces.",
    color: "from-fuchsia-400 to-indigo-500",
    emoji: "◈",
    owner: "Sam Okafor",
    updatedAt: "12 May",
    status: "archived",
    threads: 6,
    files: 3,
    tasks: { done: 12, total: 12 },
    notes: 2,
    members: [
      { name: "Sam Okafor", initials: "SO", tone: "from-rose-400 to-orange-300" },
      { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
    ],
  },
];

export type ActivityItem = {
  id: string;
  actor: { name: string; initials: string; tone: string };
  verb: string;
  target: string;
  projectId: string;
  projectName: string;
  time: string;
  kind: "thread" | "file" | "task" | "note" | "member" | "memory";
};

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", actor: { name: "Mira Chen", initials: "MC", tone: "from-emerald-400 to-cyan-300" }, verb: "replied in", target: "Refactor checkout flow", projectId: "p-checkout", projectName: "Checkout refactor", time: "2 min ago", kind: "thread" },
  { id: "a2", actor: { name: "Jordan Reed", initials: "JR", tone: "from-amber-300 to-rose-400" }, verb: "uploaded", target: "checkout-spec-v3.pdf", projectId: "p-checkout", projectName: "Checkout refactor", time: "18 min ago", kind: "file" },
  { id: "a3", actor: { name: "Priya Nair", initials: "PN", tone: "from-fuchsia-400 to-indigo-500" }, verb: "completed", target: "Draft cohort retention slide", projectId: "p-series-b", projectName: "Series-B narrative", time: "1 hour ago", kind: "task" },
  { id: "a4", actor: { name: "Nebula", initials: "✦", tone: "from-violet-500 to-sky-400" }, verb: "indexed", target: "22 new knowledge files", projectId: "p-brand", projectName: "Brand voice", time: "2 hours ago", kind: "memory" },
  { id: "a5", actor: { name: "Sam Okafor", initials: "SO", tone: "from-rose-400 to-orange-300" }, verb: "joined", target: "Brand voice", projectId: "p-brand", projectName: "Brand voice", time: "Yesterday", kind: "member" },
  { id: "a6", actor: { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" }, verb: "wrote a note in", target: "investor Q&A war-room", projectId: "p-series-b", projectName: "Series-B narrative", time: "Yesterday", kind: "note" },
];

export const TEAM = [
  { id: "u1", name: "Alex Stratos", initials: "AS", role: "Owner", title: "Founding designer", tone: "from-violet-500 to-sky-400", presence: "active", projects: ["p-checkout", "p-series-b", "p-kyoto", "p-brand"], email: "alex@nebula.app" },
  { id: "u2", name: "Mira Chen", initials: "MC", role: "Admin", title: "Engineering lead", tone: "from-emerald-400 to-cyan-300", presence: "active", projects: ["p-checkout", "p-brand"], email: "mira@nebula.app" },
  { id: "u3", name: "Priya Nair", initials: "PN", role: "Member", title: "Strategy & ops", tone: "from-fuchsia-400 to-indigo-500", presence: "idle", projects: ["p-series-b"], email: "priya@nebula.app" },
  { id: "u4", name: "Jordan Reed", initials: "JR", role: "Member", title: "Senior engineer", tone: "from-amber-300 to-rose-400", presence: "active", projects: ["p-checkout"], email: "jordan@nebula.app" },
  { id: "u5", name: "Sam Okafor", initials: "SO", role: "Member", title: "Writer", tone: "from-rose-400 to-orange-300", presence: "offline", projects: ["p-brand", "p-onboarding"], email: "sam@nebula.app" },
  { id: "u6", name: "Lin Park", initials: "LP", role: "Guest", title: "Brand consultant", tone: "from-teal-300 to-emerald-400", presence: "idle", projects: ["p-brand"], email: "lin@external.co" },
];

export const AVATARS = {
  AS: { name: "Alex Stratos", initials: "AS", tone: "from-violet-500 to-sky-400" },
  MC: { name: "Mira Chen", initials: "MC", tone: "from-emerald-400 to-cyan-300" },
  JR: { name: "Jordan Reed", initials: "JR", tone: "from-amber-300 to-rose-400" },
  PN: { name: "Priya Nair", initials: "PN", tone: "from-fuchsia-400 to-indigo-500" },
  SO: { name: "Sam Okafor", initials: "SO", tone: "from-rose-400 to-orange-300" },
};

export const SPRINTS = [
  { id: "s-current", name: "Sprint 14 · Checkout polish", range: "27 May → 9 Jun", progress: 0.62, status: "active" },
  { id: "s-next", name: "Sprint 15 · Series-B readiness", range: "10 Jun → 23 Jun", progress: 0.08, status: "next" },
  { id: "s-past", name: "Sprint 13 · Memory rollout", range: "13 May → 26 May", progress: 1, status: "past" },
];

export const TASKS = [
  { id: "t1", title: "Decompose checkout into step hooks", projectId: "p-checkout", status: "doing", priority: "p0", assignee: AVATARS.AS, due: "Tue", estimate: 6, sprint: "s-current", tags: ["refactor", "frontend"] },
  { id: "t2", title: "URL state sync for checkout machine", projectId: "p-checkout", status: "review", priority: "p1", assignee: AVATARS.MC, due: "Mon", estimate: 3, sprint: "s-current", tags: ["bug"] },
  { id: "t3", title: "Address validation edge cases", projectId: "p-checkout", status: "todo", priority: "p1", assignee: AVATARS.JR, due: "Wed", estimate: 4, sprint: "s-current", tags: ["frontend"] },
  { id: "t4", title: "Investor narrative — section 2 rewrite", projectId: "p-series-b", status: "doing", priority: "p0", assignee: AVATARS.PN, due: "Thu", estimate: 5, sprint: "s-current", tags: ["writing"] },
  { id: "t5", title: "Cohort retention chart for deck", projectId: "p-series-b", status: "done", priority: "p2", assignee: AVATARS.PN, due: "Fri", estimate: 2, sprint: "s-current", tags: ["data"] },
  { id: "t6", title: "Brand voice — error & empty states", projectId: "p-brand", status: "todo", priority: "p2", assignee: AVATARS.SO, due: "Fri", estimate: 3, sprint: "s-current", tags: ["writing"] },
  { id: "t7", title: "Kyoto — ryokan shortlist", projectId: "p-kyoto", status: "backlog", priority: "p3", assignee: AVATARS.AS, estimate: 2, tags: ["research"] },
  { id: "t8", title: "Payment step Stripe Elements wiring", projectId: "p-checkout", status: "backlog", priority: "p1", assignee: AVATARS.MC, estimate: 8, tags: ["frontend"] },
  { id: "t9", title: "Q&A war-room outline", projectId: "p-series-b", status: "todo", priority: "p1", assignee: AVATARS.PN, due: "Mon", estimate: 4, sprint: "s-next", tags: ["writing"] },
  { id: "t10", title: "Memory consolidation pass", projectId: "p-checkout", status: "done", priority: "p2", assignee: AVATARS.AS, estimate: 2, sprint: "s-current", tags: ["ai"] },
  { id: "t11", title: "Onboarding copy archive", projectId: "p-onboarding", status: "done", priority: "p3", assignee: AVATARS.SO, estimate: 1, sprint: "s-past", tags: ["writing"] },
];

export const MILESTONES = [
  { id: "m1", title: "Checkout refactor cut", projectId: "p-checkout", date: "12 Jun", status: "on-track" },
  { id: "m2", title: "Series-B deck v1", projectId: "p-series-b", date: "20 Jun", status: "at-risk" },
  { id: "m3", title: "Brand voice canon", projectId: "p-brand", date: "30 Jun", status: "on-track" },
  { id: "m4", title: "Kyoto trip", projectId: "p-kyoto", date: "14 Jul", status: "on-track" },
  { id: "m5", title: "Memory v2 GA", projectId: "p-checkout", date: "28 May", status: "shipped" },
];

export const AI_SUGGESTIONS = [
  { id: "ai1", title: "Re-balance Sprint 14", body: "Mira is at 11h, Jordan at 4h. Move 'Address validation edge cases' to Mira for an even split." },
  { id: "ai2", title: "Investor narrative needs a buffer", body: "M2 is at-risk. Suggest pushing 'Q&A war-room outline' from Sprint 15 into the current sprint to unblock Priya." },
  { id: "ai3", title: "You ship faster on Tuesdays", body: "Across the last 3 sprints, 38% of done tasks landed on Tuesday. Plan your highest-leverage work there." },
];

export const MEMORY = [
  {
    title: "Brand voice is precise, warm, never corporate",
    source: "brand-style-guide.pdf · pg 4",
    pinned: true,
  },
  {
    title: "Target ARR for FY26 is $12M with 28% MoM growth",
    source: "Series-B-pitch-deck.pdf · pg 11",
    pinned: true,
  },
  {
    title: "Engineering team prefers TypeScript + Bun runtime",
    source: "team interview · 14 May",
    pinned: false,
  },
  {
    title: "Primary persona: solo founder, ages 28–40, design-led",
    source: "research-interview-transcripts.txt",
    pinned: false,
  },
];

export const TREE: any[] = [
  {
    name: "src",
    kind: "folder",
    children: [
      {
        name: "checkout",
        kind: "folder",
        children: [
          {
            name: "useCheckoutMachine.ts",
            kind: "file",
            language: "TypeScript",
            status: "modified",
            content: `import { useState, useCallback } from "react";

export type Step = "address" | "payment" | "review" | "done";

const ORDER: Step[] = ["address", "payment", "review", "done"];

export function useCheckoutMachine() {
  const [current, setCurrent] = useState<Step>("address");
  const [completed, setCompleted] = useState<Set<Step>>(new Set());

  const advance = useCallback(() => {
    setCompleted((s) => new Set(s).add(current));
    const idx = ORDER.indexOf(current);
    if (idx < ORDER.length - 1) setCurrent(ORDER[idx + 1]);
  }, [current]);

  const goTo = useCallback(
    (s: Step) => {
      if (completed.has(s) || s === current) setCurrent(s);
    },
    [completed, current],
  );

  return { current, completed, advance, goTo };
}
`,
          },
          {
            name: "useAddress.ts",
            kind: "file",
            language: "TypeScript",
            status: "modified",
            content: `import { useForm } from "react-hook-form";

export interface AddressValues {
  line1: string;
  city: string;
  postcode: string;
  country: string;
}

export function useAddress(onComplete: (v: AddressValues) => void) {
  const form = useForm<AddressValues>({ mode: "onBlur" });
  const submit = form.handleSubmit(onComplete);
  return { ...form, submit };
}
`,
          },
          {
            name: "useCheckoutUrl.ts",
            kind: "file",
            language: "TypeScript",
            status: "new",
            content: `// hydrate + sync the current step to ?step=...\n`,
          },
        ],
      },
      {
        name: "components",
        kind: "folder",
        children: [
          { name: "AddressStep.tsx", kind: "file", language: "TSX", status: "clean" },
          { name: "PaymentStep.tsx", kind: "file", language: "TSX", status: "clean" },
          { name: "ReviewStep.tsx", kind: "file", language: "TSX", status: "clean" },
        ],
      },
      { name: "App.tsx", kind: "file", language: "TSX", status: "clean" },
    ],
  },
  {
    name: "tests",
    kind: "folder",
    children: [
      { name: "checkout.spec.ts", kind: "file", language: "TypeScript", status: "modified" },
    ],
  },
  { name: "package.json", kind: "file", language: "JSON", status: "clean" },
  { name: "README.md", kind: "file", language: "Markdown", status: "clean" },
];

export const SNIPPETS = [
  { title: "Debounce hook", lang: "ts", body: `export function useDebounced<T>(value: T, ms = 200) {\n  const [v, setV] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setV(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n  return v;\n}` },
  { title: "Fetch + cache", lang: "ts", body: `const cache = new Map<string, Promise<unknown>>();\nexport function cachedFetch<T>(url: string): Promise<T> {\n  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => r.json()));\n  return cache.get(url)! as Promise<T>;\n}` },
  { title: "Result type", lang: "ts", body: `export type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };` },
];

export const PROBLEMS = [
  { file: "src/checkout/useCheckoutMachine.ts", line: 18, kind: "warn" as const, message: "advance() uses stale closure when called inside a Promise" },
  { file: "tests/checkout.spec.ts", line: 42, kind: "error" as const, message: "Expected 'review', received 'payment' after advance()" },
];

export const FACTS: any[] = [
  { id: "m1", text: "Prefers TypeScript strict mode and exhaustive switch checks in all React projects.", source: "Conversation · Refactor checkout flow", kind: "preference", time: "Today", pinned: true },
  { id: "m2", text: "Uses react-router (not React Router DOM) and avoids any non-URL state for navigation.", source: "Conversation · Deep-link recovery", projectId: "p-checkout", kind: "convention" as any, time: "Today" },
  { id: "m3", text: "Decision: parent state machine coordinates step-scoped hooks for Checkout.", source: "Note · Architecture decisions", projectId: "p-checkout", kind: "decision", time: "Yesterday", pinned: true },
  { id: "m4", text: "Postcode service uses Loqate over Google for European address validation.", source: "File · address-validation-rfc.md", projectId: "p-checkout", kind: "decision", time: "Yesterday" },
  { id: "m5", text: "Series-B target raise: $24M at $180M valuation, lead from Sequoia.", source: "File · investor-deck-v7.pdf", projectId: "p-series-b", kind: "fact", time: "2d ago", pinned: true },
  { id: "m6", text: "Brand voice principles: confidence, restraint, warmth — never playful for product surfaces.", source: "Note · Brand voice principles", projectId: "p-brand", kind: "constraint", time: "3d ago" },
  { id: "m7", text: "Avoid mocking the database in integration tests — prefer ephemeral Postgres containers.", source: "Conversation · Test infrastructure", kind: "preference", time: "1w ago" },
  { id: "m8", text: "Kyoto trip dates: 12–17 October. Prefers ryokans over hotels.", source: "Conversation · Kyoto itinerary", projectId: "p-kyoto", kind: "fact", time: "1w ago" },
  { id: "m9", text: "Always cite specific files when reasoning across knowledge base.", source: "Settings · AI personality", kind: "preference", time: "Older" },
];

export const DEFAULT_SOURCES: any[] = [
  { id: "p", kind: "project", label: "Checkout refactor", meta: "8 files · 5 notes", enabled: true },
  { id: "f1", kind: "file", label: "useCheckoutMachine.ts", meta: "TypeScript · 1.2k", enabled: true },
  { id: "f2", kind: "file", label: "checkout-spec-v3.pdf", meta: "PDF · 284 KB", enabled: true },
  { id: "m", kind: "memory", label: "Prefers functional setState", meta: "remembered from 12 May", enabled: true },
  { id: "t", kind: "thread", label: "Refactor checkout flow", meta: "this conversation", enabled: false },
];

export const REASONING = [
  { label: "Using project memory", detail: "Checkout refactor · 5 indexed notes" },
  { label: "Pulled relevant files", detail: "useCheckoutMachine.ts, checkout-spec-v3.pdf" },
  { label: "Applied your preference", detail: "Functional setState (remembered)" },
];

export const INITIAL_CHATS: any[] = [
  { id: "c1", title: "Refactor checkout flow into hooks", time: "2:14 PM", pinned: true },
  { id: "c2", title: "Series-B narrative & investor questions", time: "11:08 AM", pinned: true },
  { id: "c3", title: "Resn-inspired hero animation ideas", time: "11:08 AM" },
  { id: "c4", title: "Quarterly investor update draft", time: "Yesterday" },
  { id: "c5", title: "SQL: cohort retention query", time: "Yesterday" },
  { id: "c6", title: "Kyoto 5-day itinerary", time: "Mon" },
  { id: "c7", title: "Compare Vite vs Turbopack", time: "Sun" },
  { id: "c8", title: "Brand voice exploration", time: "Sat" },
  { id: "c9", title: "Old onboarding copy", time: "12 May", archived: true },
];

export const LONG_THREAD: any[] = [
  {
    id: "u-1",
    role: "user",
    time: "2:14 PM",
    blocks: [
      {
        type: "text",
        content:
          "I'm refactoring our checkout flow. Right now it's a single 800-line component handling cart state, address validation, payment, and confirmation. Can you propose a clean architecture using hooks, and give me a starting implementation for the address step?",
      },
    ],
  },
  {
    id: "a-1",
    role: "ai",
    time: "2:14 PM",
    tokens: 1284,
    blocks: [
      {
        type: "text",
        content:
          "Happy to. The pattern I'd reach for here is **a small set of step-scoped hooks coordinated by a parent state machine** — it keeps each step independently testable while giving you one source of truth for the cross-cutting bits (cart totals, current step, validation gates).\n\n## Architecture in three layers\n- **`useCheckoutMachine`** — the orchestrator. Knows the steps, transitions, and which step is `current`. Pure logic, no UI.\n- **Step hooks** (`useAddress`, `usePayment`, `useReview`) — own their local form state, validation, and submission. Each returns `{ values, errors, submit, isValid }`.\n- **Step components** — dumb. Read from their hook, render fields, call `submit()` to advance the machine.\n\nThis maps cleanly to the way you already think about it (\"the address step\") without forcing a heavy state library.",
      },
      {
        type: "code",
        language: "TypeScript",
        filename: "useCheckoutMachine.ts",
        content: `import { useState, useCallback } from "react";

export type Step = "address" | "payment" | "review" | "done";

const ORDER: Step[] = ["address", "payment", "review", "done"];

export function useCheckoutMachine() {
  const [current, setCurrent] = useState<Step>("address");
  const [completed, setCompleted] = useState<Set<Step>>(new Set());

  const advance = useCallback(() => {
    setCompleted((s) => new Set(s).add(current));
    const idx = ORDER.indexOf(current);
    if (idx < ORDER.length - 1) setCurrent(ORDER[idx + 1]);
  }, [current]);

  const goTo = useCallback(
    (s: Step) => {
      // can only jump back to completed steps
      if (completed.has(s) || s === current) setCurrent(s);
    },
    [completed, current],
  );

  return { current, completed, advance, goTo };
}`,
      },
      {
        type: "text",
        content:
          "Now the address step itself. I'm using `react-hook-form` because it gives you debounced validation and clean field registration without a re-render storm.",
      },
      {
        type: "code",
        language: "TypeScript",
        filename: "useAddress.ts",
        content: `import { useForm } from "react-hook-form";

export interface AddressValues {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export function useAddress(onComplete: (v: AddressValues) => void) {
  const form = useForm<AddressValues>({
    mode: "onBlur",
    defaultValues: { country: "US" },
  });

  const submit = form.handleSubmit(async (values) => {
    const ok = await verifyPostcode(values.postcode, values.country);
    if (!ok) {
      form.setError("postcode", { message: "We couldn't verify this postcode" });
      return;
    }
    onComplete(values);
  });

  return { ...form, submit };
}`,
      },
      {
        type: "text",
        content:
          "## Why this holds up\n- Each step hook is **trivially mockable** in tests — pass a fake `onComplete`, assert it fired with valid values.\n- The machine is **serialisable** — drop `current` + `completed` into URL state and you get deep-linkable checkout steps for free.\n- Cross-cutting concerns like the cart total stay in a single `useCart()` hook above the machine.\n\nWant me to sketch the `usePayment` hook next (Stripe Elements + 3DS handling), or wire up the URL-state sync so refreshes don't kick people back to step one?",
      },
    ],
  },
  {
    id: "u-2",
    role: "user",
    time: "2:18 PM",
    blocks: [
      {
        type: "text",
        content:
          "URL state sync first — losing progress on refresh is the actual bug we're trying to fix.",
      },
    ],
  },
  {
    id: "a-2",
    role: "ai",
    time: "2:19 PM",
    tokens: 642,
    blocks: [
      {
        type: "text",
        content:
          "Good call. Two pieces: write the current step to the URL, hydrate from it on mount. Anything not in the URL stays local — don't be tempted to put form values there, it's user-hostile.",
      },
      {
        type: "code",
        language: "TypeScript",
        filename: "useCheckoutUrl.ts",
        content: `import { useEffect } from "react";
import { useSearchParams } from "react-router";

export function useCheckoutUrl(
  current: Step,
  goTo: (s: Step) => void,
) {
  const [params, setParams] = useSearchParams();

  // hydrate once
  useEffect(() => {
    const fromUrl = params.get("step") as Step | null;
    if (fromUrl && fromUrl !== current) goTo(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync on change
  useEffect(() => {
    setParams(
      (p) => {
        p.set("step", current);
        return p;
      },
      { replace: true },
    );
  }, [current, setParams]);
}`,
      },
      {
        type: "text",
        content:
          "Use `replace: true` so the back button doesn't trap users inside the funnel. Mount this once inside the machine provider and the bug is gone.",
      },
    ],
  },
];
