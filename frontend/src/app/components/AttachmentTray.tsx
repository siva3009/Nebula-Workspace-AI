import { motion, AnimatePresence } from "motion/react";
import { FileText, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";

export type Attachment = {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image" | "doc" | "code";
  progress: number;
};

interface Props {
  items: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentTray({ items, onRemove }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <AnimatePresence>
          {items.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#101013]/90 py-2 pr-2 pl-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-400/20 text-violet-200">
                {a.kind === "image" ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="max-w-[180px] truncate text-[12px] text-white/90">
                  {a.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-white/40">
                  <span>{a.size}</span>
                  {a.progress < 100 ? (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-violet-300/80">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        {Math.round(a.progress)}% · indexing
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-300/80">
                      <Check className="h-2.5 w-2.5" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemove(a.id)}
                className="grid h-6 w-6 place-items-center rounded-md text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
              {a.progress < 100 && (
                <span
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet-400 to-sky-400 transition-all"
                  style={{ width: `${a.progress}%` }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
