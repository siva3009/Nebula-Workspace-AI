import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/[0.04] ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-4">
      <Shimmer className="h-9 w-9 rounded-xl" />
      <div className="flex-1 space-y-3">
        <Shimmer className="h-3 w-32" />
        <div className="space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-[92%]" />
          <Shimmer className="h-3 w-[78%]" />
        </div>
        <Shimmer className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ThinkingPulse({ label = "Reasoning" }: { label?: string }) {
  return (
    <div className="flex gap-4">
      <div className="relative h-9 w-9 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 blur-md"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400">
          <Sparkles className="h-4 w-4 text-[#0A0A0B]" strokeWidth={2.2} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-white/85">Nebula</span>
          <span className="text-white/40">· {label}</span>
        </div>
        <div className="space-y-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
          {["Parsing your request", "Searching context", "Composing response"].map(
            (step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                className="flex items-center gap-2.5 text-[12.5px] text-white/65"
              >
                <span className="h-1 w-1 rounded-full bg-gradient-to-r from-violet-300 to-sky-300" />
                {step}
              </motion.div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex justify-between"><Shimmer className="h-3 w-16" /><Shimmer className="h-4 w-4 rounded-full" /></div>
            <Shimmer className="mt-4 h-8 w-20" />
            <Shimmer className="mt-2 h-2 w-12" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] p-5">
        <Shimmer className="h-4 w-32 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}

export function AnalysisHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2"><Shimmer className="h-4 w-48" /><Shimmer className="h-4 w-16 rounded-md" /></div>
            <Shimmer className="h-3 w-64" />
            <Shimmer className="h-2 w-24" />
          </div>
          <div className="flex gap-3">
            <Shimmer className="h-10 w-12 rounded-lg" />
            <Shimmer className="h-10 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KnowledgeLibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex justify-between items-start">
            <Shimmer className="h-10 w-10 rounded-lg" />
            <Shimmer className="h-6 w-6 rounded-md" />
          </div>
          <Shimmer className="mt-4 h-4 w-3/4" />
          <Shimmer className="mt-2 h-3 w-1/2" />
          <div className="mt-4 border-t border-white/[0.05] pt-3 flex flex-col gap-2">
            <Shimmer className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div><Shimmer className="h-8 w-48 mb-2" /><Shimmer className="h-3 w-64" /></div>
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <Shimmer className="h-64 w-full rounded-xl" />
          <Shimmer className="h-40 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Shimmer className="h-96 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProjectExplorerSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <Shimmer className="h-4 w-24 mb-4" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer className={`h-4 w-4 rounded ${i % 3 === 0 ? 'ml-0' : 'ml-4'}`} />
          <Shimmer className={`h-3 ${i % 2 === 0 ? 'w-32' : 'w-24'}`} />
        </div>
      ))}
    </div>
  );
}

export function CollaborationSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Shimmer className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 rounded-xl border border-white/[0.05] p-3">
            <div className="flex justify-between"><Shimmer className="h-3 w-20" /><Shimmer className="h-2 w-12" /></div>
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
