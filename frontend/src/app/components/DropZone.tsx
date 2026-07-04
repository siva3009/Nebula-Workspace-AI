import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, ImageIcon, Sparkles } from "lucide-react";

export function DropZone({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-[#0A0A0B]/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl p-8"
          >
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-violet-500/25 via-fuchsia-400/15 to-sky-400/25 blur-2xl" />
            <div className="relative rounded-[24px] border-2 border-dashed border-violet-300/40 bg-[#0E0E10]/90 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-16 w-16"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-sky-400 opacity-70 blur-xl" />
                  <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400">
                    <Upload className="h-7 w-7 text-[#0A0A0B]" strokeWidth={2.2} />
                  </div>
                </motion.div>
              </div>
              <h2
                className="mt-6 text-white"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 38,
                  lineHeight: 1.1,
                }}
              >
                Drop to add to Nebula
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] text-white/55">
                Documents, images, code, and audio — anything you drop becomes
                part of this conversation's working memory.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2.5 text-[11px] text-white/40">
                <Chip icon={FileText} label="PDF · DOCX · TXT" />
                <Chip icon={ImageIcon} label="PNG · JPG · WEBP" />
                <Chip icon={Sparkles} label="Auto-parse" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
      <Icon className="h-3 w-3 text-violet-300" />
      {label}
    </span>
  );
}
