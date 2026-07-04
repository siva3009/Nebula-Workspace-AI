import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  FileAudio,
  Upload,
  Plus,
  Search,
  Brain,
  MoreHorizontal,
  Sparkles,
  Link as LinkIcon,
  Database,
  Filter,
  Loader2,
} from "lucide-react";
import { uploadFile, fetchKnowledgeFiles } from "../services/chatService";
import { EmptyState } from "./ui/empty-state";
import { KnowledgeLibrarySkeleton } from "./Skeleton";

import { MEMORY as _MEMORY } from "../mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const MEMORY = isDemoMode ? _MEMORY : [];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileType(mimeType: string, name: string): string {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (/\.(tsx?|jsx?|py|go|rs|css)$/.test(name)) return "code";
  return "text";
}

function getFileColor(type: string): string {
  switch (type) {
    case "pdf": return "from-rose-400/40 to-rose-400/0";
    case "image": return "from-fuchsia-400/40 to-fuchsia-400/0";
    case "code": return "from-amber-300/40 to-amber-300/0";
    default: return "from-sky-400/40 to-sky-400/0";
  }
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function KnowledgePanel() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    try {
      const data = await fetchKnowledgeFiles();
      setFiles(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      e.target.value = "";
      for (const file of selected) {
        try {
          await uploadFile(file);
        } catch {
          // ignore individual failures
        }
      }
      // Refresh list
      loadFiles();
    },
    [loadFiles],
  );

  const totalChunks = files.reduce(
    (acc: number, f: any) => acc + (f._count?.chunks ?? 0),
    0,
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pt-10 pb-12">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple
        accept=".pdf,.txt,.md"
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Workspace · Nebula Pro
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
            Knowledge & memory
          </h1>
          <p className="mt-2 max-w-xl text-[13.5px] text-white/45">
            Everything Nebula remembers about your work — your files, your
            decisions, and the context that makes every reply sharper.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12.5px] text-white/75 transition hover:bg-white/[0.06] hover:text-white">
            <LinkIcon className="h-3.5 w-3.5" />
            Connect source
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative overflow-hidden rounded-lg bg-white px-4 py-2 text-[12.5px] text-[#0A0A0B] transition"
          >
            <span className="absolute inset-0 bg-gradient-to-br from-violet-300 via-white to-sky-300 opacity-0 transition group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" strokeWidth={2.5} />
              Upload files
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Files indexed", value: String(files.filter((f: any) => f.status === "READY").length), sub: `${files.length} total`, icon: FileText },
          { label: "Total chunks", value: String(totalChunks), sub: "across all files", icon: Brain },
          { label: "Vector storage", value: "Qdrant", sub: "cosine similarity", icon: Database },
          { label: "Pipeline", value: files.some((f: any) => f.status === "PROCESSING") ? "Active" : "Idle", sub: files.some((f: any) => f.status === "PROCESSING") ? "indexing…" : "all files ready", icon: Sparkles },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Files */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] text-white/90">Files</h2>
            <p className="text-[12px] text-white/40">
              Drop anywhere on the page to add new sources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 sm:flex">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input
                placeholder="Filter files"
                className="w-40 bg-transparent text-[12px] text-white/85 outline-none placeholder:text-white/30"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11.5px] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
              <Filter className="h-3 w-3" />
              All types
            </button>
          </div>
        </div>

        {loading ? (
          <KnowledgeLibrarySkeleton />
        ) : files.length === 0 ? (
          <EmptyState
            icon={Database}
            title="Knowledge Library is Empty"
            description="Upload documents to provide Nebula with context about your projects, brand voice, and goals."
            action={{
              label: "Upload files",
              onClick: () => fileInputRef.current?.click()
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f: any, i: number) => {
              const type = getFileType(f.mimeType, f.originalName);
              return (
                <FileCard
                  key={f.id}
                  file={{
                    name: f.originalName,
                    type,
                    size: formatFileSize(f.size),
                    chunks: f._count?.chunks ?? 0,
                    updated: formatTimeAgo(f.updatedAt),
                    color: getFileColor(type),
                    indexed: f.status === "READY" ? 100 : f.status === "PROCESSING" ? 50 : 0,
                    status: f.status,
                  }}
                  delay={i * 0.04}
                />
              );
            })}
            <UploadTile onClick={() => fileInputRef.current?.click()} />
          </div>
        )}
      </section>

      {/* Memory */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] text-white/90">AI Memory</h2>
            <p className="text-[12px] text-white/40">
              Facts Nebula recalls across every conversation
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60 transition hover:bg-white/[0.05] hover:text-white">
            <Plus className="h-3 w-3" />
            Add memory
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015]">
          {MEMORY.map((m, i) => (
            <MemoryRow key={i} memory={m} first={i === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-sky-400/0 blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-white/30" />
      </div>
      <div className="mt-3 tabular-nums text-white/95" style={{ fontSize: 26 }}>
        {value}
      </div>
      <div className="text-[11px] text-white/40">{sub}</div>
    </motion.div>
  );
}

function FileCard({ file, delay }: { file: { name: string; type: string; size: string; chunks: number; updated: string; color: string; indexed: number; status: string }; delay: number }) {
  const Icon =
    file.type === "image"
      ? ImageIcon
      : file.type === "code"
        ? FileCode
        : file.type === "audio"
          ? FileAudio
          : FileText;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${file.color} blur-2xl opacity-60 transition group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.06] bg-[#0E0E10] text-white/80">
          <Icon className="h-4 w-4" />
        </div>
        <button className="rounded-md p-1 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="relative mt-4">
        <div className="truncate text-[13px] text-white/90">{file.name}</div>
        <div className="mt-0.5 text-[11px] text-white/40">
          {file.size}
          {file.chunks > 0 && ` · ${file.chunks} chunks`} · {file.updated}
        </div>
      </div>
      <div className="relative mt-4 border-t border-white/[0.05] pt-3">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="tracking-[0.16em] text-white/40 uppercase">
            {file.status === "PROCESSING" ? "Indexing" : file.status === "ERROR" ? "Error" : "Indexed"}
          </span>
          <span className="tabular-nums text-white/65">{file.indexed}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full ${file.status === "ERROR" ? "bg-rose-400" : "bg-gradient-to-r from-violet-400 to-sky-400"}`}
            style={{ width: `${file.indexed}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function UploadTile({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative grid place-items-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.005] p-8 text-center transition hover:border-violet-300/30 hover:bg-white/[0.02]"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70 transition group-hover:border-violet-300/30 group-hover:text-violet-200">
        <Plus className="h-4 w-4" />
      </div>
      <div className="mt-3 text-[13px] text-white/75">Add file</div>
      <div className="mt-0.5 text-[11px] text-white/35">
        or drop anywhere on the page
      </div>
    </button>
  );
}

function MemoryRow({
  memory,
  first,
}: {
  memory: (typeof MEMORY)[0];
  first: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.03] ${
        first ? "" : "border-t border-white/[0.04]"
      }`}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-400/20 text-violet-200">
        <Brain className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] text-white/90">{memory.title}</div>
        <div className="mt-0.5 text-[11px] text-white/40">
          from {memory.source}
        </div>
      </div>
      {memory.pinned && (
        <span className="rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-2 py-0.5 text-[10px] tracking-wider text-violet-200/80 uppercase">
          Pinned
        </span>
      )}
      <button className="rounded-md p-1.5 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

