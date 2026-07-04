import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Clock,
  Trash2,
  FileArchive,
  ArrowRight,
  TrendingUp,
  Gauge,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./ui/empty-state";

interface AnalysisHistoryProps {
  history: any[];
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  onWorkspaceScan: (path: string) => void;
  onDelete: (id: string) => void;
  uploading: boolean;
  uploadProgress: string;
}

interface HistoryRecordRowProps {
  record: any;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  formatBytes: (bytes: number) => string;
  formatDate: (dateStr: string) => string;
  getScoreColor: (score: number) => string;
}

const HistoryRecordRow = React.memo(function HistoryRecordRow({
  record,
  onSelect,
  onDelete,
  formatBytes,
  formatDate,
  getScoreColor,
}: HistoryRecordRowProps) {
  return (
    <div
      onClick={() => onSelect(record.id)}
      className="p-4.5 hover:bg-white/[0.01] transition flex items-center justify-between gap-4 cursor-pointer group select-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium text-white/90 truncate group-hover:text-violet-300 transition">
            {record.workspaceName || record.projectName || record.fileName}
          </span>
          {record.workspacePath ? (
            <span className="rounded-md border border-sky-500/10 bg-sky-500/10 px-1.5 py-0.2 text-[9.5px] text-sky-300 font-semibold uppercase tracking-wider shrink-0">
              Workspace
            </span>
          ) : (
            <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.2 text-[9.5px] text-white/40 font-semibold uppercase tracking-wider shrink-0">
              ZIP Archive
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/45">
          {record.workspacePath ? (
            <span className="truncate max-w-[280px]" title={record.workspacePath}>Path: {record.workspacePath}</span>
          ) : (
            <span className="truncate max-w-[150px]">File: {record.fileName}</span>
          )}
          <span>• Size: {formatBytes(record.fileSize)}</span>
          <span>• Type: {record.projectType}</span>
        </div>

        {record.summary && (
          <div className="mt-2 text-[11.5px] text-violet-300/80 leading-normal bg-violet-500/[0.01] border border-violet-500/5 px-2.5 py-1 rounded-lg w-max max-w-full truncate">
            {record.summary}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-white/35">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(record.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Score Badges */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] text-white/30 uppercase tracking-wider block mb-0.5">Health</span>
            <span className={`rounded-lg border px-2 py-1 text-[12px] font-semibold tabular-nums ${getScoreColor(record.healthScore)}`}>
              {record.healthScore}
            </span>
          </div>
          {record.securityScore !== undefined && record.securityScore !== null && (
            <div className="flex flex-col items-center">
              <span className="text-[8.5px] text-white/30 uppercase tracking-wider block mb-0.5">Security</span>
              <span className={`rounded-lg border px-2 py-1 text-[12px] font-semibold tabular-nums ${getScoreColor(record.securityScore)}`}>
                {record.securityScore}
              </span>
            </div>
          )}
        </div>

        {/* Delete trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(record.id);
          }}
          className="rounded-lg p-2 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition"
          title="Delete scan"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
});

export function AnalysisHistory({
  history,
  onSelect,
  onUpload,
  onWorkspaceScan,
  onDelete,
  uploading,
  uploadProgress,
}: AnalysisHistoryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [workspacePath, setWorkspacePath] = useState("");

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/10";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/10";
    return "text-rose-400 bg-rose-500/10 border-rose-500/10";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find((f) => f.name.toLowerCase().endsWith(".zip"));
    if (zipFile) {
      onUpload(zipFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspacePath.trim()) {
      toast.error("Please enter a workspace directory path");
      return;
    }
    onWorkspaceScan(workspacePath.trim());
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Upload & Workspace Scan Zones (Left/Top 4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Workspace Scan Panel */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
          <h3 className="text-sm font-medium text-white/95 flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4 text-sky-300" /> Analyze Workspace
          </h3>
          <p className="mt-1 text-[11.5px] text-white/40 leading-relaxed">
            Enter the absolute filesystem path of a local project folder to run diagnostics directly on disk.
          </p>

          <form onSubmit={handleWorkspaceSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={workspacePath}
              onChange={(e) => setWorkspacePath(e.target.value)}
              placeholder="e.g. d:/projects/my-node-app"
              disabled={uploading}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-[12.5px] text-white/90 outline-none placeholder:text-white/20 focus:border-sky-400/50 transition"
            />
            <button
              type="submit"
              disabled={uploading || !workspacePath.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 py-2.5 text-[12.5px] font-semibold text-[#0A0A0B] transition hover:brightness-110 disabled:opacity-40"
            >
              Analyze Workspace
            </button>
          </form>
        </div>

        {/* Upload ZIP Panel */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
          <h3 className="text-sm font-medium text-white/95 flex items-center gap-1.5">
            <UploadCloud className="h-4 w-4 text-violet-300" /> Upload Project ZIP
          </h3>
          <p className="mt-1 text-[11.5px] text-white/40 leading-relaxed">
            Upload a ZIP archive containing your repository source tree. We support Node, Python, TS, Go, Rust, and standard web stacks.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".zip"
            className="hidden"
            disabled={uploading}
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`mt-4 border border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
              uploading
                ? "border-violet-500/30 bg-violet-500/[0.02]"
                : dragging
                ? "border-violet-400 bg-violet-500/[0.05] text-white"
                : "border-white/10 bg-white/[0.005] hover:border-white/20 hover:bg-white/[0.02] text-white/50"
            }`}
          >
            {uploading ? (
              <div className="space-y-3">
                <div className="relative mx-auto h-10 w-10">
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                </div>
                <div className="text-[12px] text-violet-300 font-medium">{uploadProgress}</div>
              </div>
            ) : (
              <>
                <FileArchive className="h-8 w-8 text-violet-300 opacity-80 mb-2.5" />
                <span className="text-[12.5px] font-medium text-white/80 block">Drag & drop project ZIP</span>
                <span className="text-[11px] text-white/35 block mt-1">or click to browse files</span>
              </>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 text-[12px] leading-relaxed text-white/55 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" />
            <span>
              <strong>Single-Pass Aggregation</strong>: Runs Project, Bug, Code, and Security reviews in parallel without duplicate processing.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Call History</strong>: Retrieves past scans instantly from the database without invoking AI models.
            </span>
          </div>
        </div>
      </div>

      {/* History List (Right/Bottom 8 Cols) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <header className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/95">Historical Analysis Reports</h3>
              <p className="mt-1 text-[11.5px] text-white/40">
                View previous codebase scans and diagnostic records.
              </p>
            </div>
            <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50 font-medium tabular-nums">
              Total: {history.length}
            </span>
          </header>

          <div className="divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto [scrollbar-width:thin]">
            {history.length > 0 ? (
              history.map((record) => (
                <HistoryRecordRow
                  key={record.id}
                  record={record}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  formatBytes={formatBytes}
                  formatDate={formatDate}
                  getScoreColor={getScoreColor}
                />
              ))
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={Gauge}
                  title="No analysis history found"
                  description="Configure a local workspace directory or upload a codebase ZIP archive to start compiling diagnostics."
                  action={{
                    label: "Select ZIP Archive",
                    onClick: () => {
                      if (!uploading && fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
