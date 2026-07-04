import { motion, AnimatePresence } from "motion/react";
import {
  X,
  FileText,
  Sparkles,
  Clock,
  Cpu,
  Hash,
  Quote,
  Link as LinkIcon,
  ExternalLink,
  Pin,
  Share2,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  threadTitle: string;
  modelName: string;
}

export function DetailsPanel({ open, onClose, threadTitle, modelName }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="relative z-20 hidden h-full w-[340px] shrink-0 border-l border-white/[0.06] bg-[#0B0B0C]/85 backdrop-blur-2xl lg:flex lg:flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                Thread details
              </div>
              <div className="mt-0.5 max-w-[220px] truncate text-[13px] text-white/90">
                {threadTitle}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:thin]">
            <Block label="Model">
              <Row icon={Sparkles} label={modelName} sub="Reasoning · 1M ctx" />
            </Block>

            <Block label="Conversation">
              <div className="grid grid-cols-2 gap-2">
                <Stat icon={Hash} label="Messages" value="6" />
                <Stat icon={Clock} label="Started" value="2:14 PM" />
                <Stat icon={Cpu} label="Tokens" value="1,926" />
                <Stat icon={Pin} label="Pinned" value="Yes" />
              </div>
            </Block>

            <Block label="Attached sources">
              {[
                { name: "checkout-component.tsx", meta: "12 KB · code" },
                { name: "use-react-router.md", meta: "4 KB · docs" },
              ].map((s) => (
                <button
                  key={s.name}
                  className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-violet-500/15 to-sky-400/15 text-violet-200">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] text-white/90">
                      {s.name}
                    </div>
                    <div className="text-[10.5px] text-white/40">{s.meta}</div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-white/30 transition group-hover:text-white" />
                </button>
              ))}
            </Block>

            <Block label="Citations from this reply">
              {[
                {
                  q: "use replace:true so the back button doesn't trap users",
                  src: "react-router · useSearchParams",
                },
                {
                  q: "step-scoped hooks coordinated by a parent state machine",
                  src: "internal · checkout-arch.md",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3"
                >
                  <div className="flex items-start gap-2">
                    <Quote className="mt-0.5 h-3 w-3 shrink-0 text-violet-300/70" />
                    <p className="text-[12px] leading-relaxed text-white/75">
                      {c.q}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10.5px] text-white/40">
                    <span className="inline-flex items-center gap-1">
                      <LinkIcon className="h-2.5 w-2.5" />
                      {c.src}
                    </span>
                    <button className="text-violet-300/70 hover:text-violet-200">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </Block>
          </div>

          <div className="border-t border-white/[0.06] p-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-[12.5px] text-white/85 transition hover:bg-white/[0.06]">
              <Share2 className="h-3.5 w-3.5" />
              Share this thread
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2.5 text-[10px] tracking-[0.22em] text-white/30 uppercase">
        {label}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub }: { icon: any; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-sky-400 text-[#0A0A0B]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12.5px] text-white/90">{label}</div>
        <div className="text-[10.5px] text-white/40">{sub}</div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.16em] text-white/40 uppercase">
        <Icon className="h-2.5 w-2.5" /> {label}
      </div>
      <div className="mt-1.5 tabular-nums text-[15px] text-white/95">{value}</div>
    </div>
  );
}
