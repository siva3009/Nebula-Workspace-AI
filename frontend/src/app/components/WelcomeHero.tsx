import { motion } from "motion/react";
import {
  Code2,
  PenLine,
  Compass,
  ImageIcon,
  ArrowUpRight,
} from "lucide-react";

const SUGGESTIONS = [
  {
    icon: Code2,
    title: "Refactor a TypeScript module",
    sub: "Code · Engineering",
    color: "from-violet-500/30 to-violet-500/0",
  },
  {
    icon: PenLine,
    title: "Draft a launch announcement",
    sub: "Writing · Marketing",
    color: "from-sky-400/30 to-sky-400/0",
  },
  {
    icon: Compass,
    title: "Plan a 5-day trip to Kyoto",
    sub: "Research · Travel",
    color: "from-emerald-300/30 to-emerald-300/0",
  },
  {
    icon: ImageIcon,
    title: "Describe an image in detail",
    sub: "Vision · Multimodal",
    color: "from-rose-300/30 to-rose-300/0",
  },
];

export function WelcomeHero({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 pt-20 pb-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] tracking-[0.18em] text-white/55 uppercase backdrop-blur w-fit"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Nebula Opus 4.7 · Online
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 text-white/95"
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(48px, 6vw, 76px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        Good evening, <em className="text-white/60">Alex.</em>
        <br />
        How can I think with you?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="mx-auto mt-5 max-w-lg text-[14px] leading-relaxed text-white/45"
      >
        A premium reasoning workspace — from a casual question to a complex
        research thread. Type, attach, or pick a starting point below.
      </motion.p>

      <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06, duration: 0.5 }}
            whileHover={{ y: -2 }}
            onClick={() => onPick(s.title)}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} blur-2xl opacity-60 transition group-hover:opacity-100`}
            />
            <div className="relative flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/80">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-white/90">{s.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/80" />
                </div>
                <div className="mt-0.5 text-[11px] tracking-[0.14em] text-white/35 uppercase">
                  {s.sub}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
