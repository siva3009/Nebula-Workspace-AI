import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  File as FileIcon,
  GitBranch,
  Play,
  Bug,
  Wand2,
  BookOpen,
  Sparkles,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  CornerDownLeft,
  Copy,
  Cpu,
  Trash2,
  Edit2,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "./ui/Toggle";
import {
  fetchWorkspaces,
  fetchWorkspaceDetails,
  createFileOrFolder,
  renameFileOrFolder,
  deleteFileOrFolder,
  importWorkspace,
  uploadZipWorkspace,
} from "../services/chatService";

type Mode = "build" | "debug" | "refactor" | "explain";

type FileNode = {
  name: string;
  path: string; // relative path using forward slashes
  kind: "file" | "folder";
  language?: string;
  children?: FileNode[];
  content?: string;
  status?: "modified" | "new" | "clean";
};

import { SNIPPETS as _SNIPPETS, PROBLEMS as _PROBLEMS } from "../mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const SNIPPETS = isDemoMode ? _SNIPPETS : [];
const PROBLEMS = isDemoMode ? _PROBLEMS : [];

const MODES: { id: Mode; label: string; icon: typeof Wand2; tint: string; hint: string }[] = [
  { id: "build", label: "Build", icon: Sparkles, tint: "from-violet-500 to-sky-400", hint: "Write new code with context from the open files." },
  { id: "debug", label: "Debug", icon: Bug, tint: "from-rose-400 to-amber-300", hint: "Trace a failing test, stack, or runtime error." },
  { id: "refactor", label: "Refactor", icon: Wand2, tint: "from-emerald-400 to-cyan-300", hint: "Restructure without changing behaviour." },
  { id: "explain", label: "Explain", icon: BookOpen, tint: "from-amber-300 to-rose-400", hint: "Walk through what selected code does, line by line." },
];

export function CodingWorkspace() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [activePath, setActivePath] = useState("");
  const [mode, setMode] = useState<Mode>("debug");
  const [prompt, setPrompt] = useState("");
  const [smartContext, setSmartContext] = useState(true);
  const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);
  const [bottom, setBottom] = useState<"terminal" | "problems">("problems");

  // Dynamic Workspace states (single source of truth matching QA definitions)
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, _setActiveWorkspace] = useState<any | null>(null);
  const setActiveWorkspace = useCallback((val: any) => {
    console.warn("[DEBUG setActiveWorkspace] Invoked!");
    console.warn("[DEBUG setActiveWorkspace] Previous value:", activeWorkspace);
    console.warn("[DEBUG setActiveWorkspace] New value:", val);
    console.trace("[DEBUG setActiveWorkspace] Stack Trace:");
    _setActiveWorkspace(val);
  }, [activeWorkspace]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  // Metadata states that clear upon unmount/deletion
  const [currentBranch, setCurrentBranch] = useState<string | null>("feature/url-state");
  const [problemCount, setProblemCount] = useState<number>(2);

  // Dialogs inputs states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPath, setImportPath] = useState("");
  const [importName, setImportName] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [createParentPath, setCreateParentPath] = useState("");

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameOldPath, setRenameOldPath] = useState("");
  const [renameNewName, setRenameNewName] = useState("");

  const zipInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedWorkspace with activeWorkspace
  useEffect(() => {
    setSelectedWorkspace(activeWorkspace);
  }, [activeWorkspace]);

  // Load Workspaces list on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchWorkspaces();
        setWorkspaces(data);
      } catch (err: any) {
        toast.error(`Failed to load workspaces list: ${err.message}`);
      }
    };
    init();
  }, []);

  // Single Source of Truth Workspace list synchronizer
  useEffect(() => {
    if (workspaces.length === 0) {
      _setActiveWorkspace(null);
      setSelectedWorkspace(null);
      setWorkspaceFiles([]);
      setActivePath("");
      setPinnedFiles([]);
      setCurrentBranch(null);
      setProblemCount(0);
    } else {
      // If we have workspaces, ensure we have a valid active workspace
      const currentActiveExists = activeWorkspace && workspaces.some((w) => w.id === activeWorkspace.id);
      if (!currentActiveExists) {
        // Auto-select the first one
        _setActiveWorkspace(workspaces[0]);
        setCurrentBranch("feature/url-state");
        setProblemCount(2);
      }
    }
  }, [workspaces, activeWorkspace]);

  // Simple list update helper that does not modify the active workspace selection
  const refreshWorkspacesList = async () => {
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch (err: any) {
      toast.error(`Failed to refresh workspaces: ${err.message}`);
    }
  };

  // Load Workspace files on change
  const loadWorkspaceDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const details = await fetchWorkspaceDetails(id);
      setWorkspaceFiles(details.files);
    } catch (err: any) {
      toast.error(`Failed to retrieve file explorer files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      loadWorkspaceDetails(activeWorkspace.id);
    } else {
      setWorkspaceFiles([]);
    }
  }, [activeWorkspace, loadWorkspaceDetails]);

  // Dynamic flattener
  const flatFiles = useMemo(() => flatten(workspaceFiles), [workspaceFiles]);
  const activeFile = useMemo(() => flatFiles.find((f) => f.path === activePath), [flatFiles, activePath]);
  const activeMode = useMemo(() => MODES.find((m) => m.id === mode)!, [mode]);

  // Handle auto-focus pins inside open workspace
  useEffect(() => {
    if (activeWorkspace && flatFiles.length > 0) {
      const activeExists = flatFiles.some((f) => f.path === activePath);
      if (!activeExists) {
        const firstFile = flatFiles.find((f) => f.kind === "file");
        if (firstFile) {
          setActivePath(firstFile.path);
          setPinnedFiles([firstFile.path]);
        }
      }
    } else if (!activeWorkspace) {
      setActivePath("");
      setPinnedFiles([]);
    }
  }, [flatFiles, activeWorkspace, activePath]);

  const togglePin = (path: string) =>
    setPinnedFiles((xs) => (xs.includes(path) ? xs.filter((p) => p !== path) : [...xs, path]));

  // ─── Workspace Handlers ────────────────────────────────────────────

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPath.trim()) return;
    setImportLoading(true);
    try {
      const newWs = await importWorkspace(importPath.trim(), importName.trim() || undefined);
      toast.success("Workspace folder mounted successfully");
      setShowImportDialog(false);
      setImportPath("");
      setImportName("");
      const list = await fetchWorkspaces();
      setWorkspaces(list);
      const match = list.find((w) => w.path === newWs.path) || newWs;
      setActiveWorkspace(match);
      setCurrentBranch("feature/url-state");
      setProblemCount(2);
    } catch (err: any) {
      toast.error(`Import path failure: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLoading(true);
    try {
      const newWs = await uploadZipWorkspace(file);
      toast.success(`${file.name} successfully extracted`);
      const list = await fetchWorkspaces();
      setWorkspaces(list);
      const match = list.find((w) => w.id === newWs.id) || newWs;
      setActiveWorkspace(match);
      setCurrentBranch("feature/url-state");
      setProblemCount(2);
    } catch (err: any) {
      toast.error(`ZIP extract failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to unmount and delete the workspace "${name}"?`)) {
      try {
        // 1. Immediately clear frontend states synchronously to prevent any stale metadata showing up during wait
        const isActiveDeleted = !activeWorkspace || activeWorkspace.id === id || activeWorkspace.name === name;
        
        if (isActiveDeleted) {
          setActiveWorkspace(null);
          setSelectedWorkspace(null);
          setWorkspaceFiles([]);
          setActivePath("");
          setPinnedFiles([]);
          setCurrentBranch(null);
          setProblemCount(0);
        }

        // 2. Perform backend delete
        await deleteWorkspace(id);
        toast.success("Workspace deleted");
        
        // 3. Refresh workspaces dropdown lists
        await refreshWorkspacesList();
      } catch (err: any) {
        toast.error(`Deletion failed: ${err.message}`);
      }
    }
  };

  // ─── File CRUD Handlers ────────────────────────────────────────────

  const triggerCreateDialog = (parentPath: string, type: "file" | "folder") => {
    if (!activeWorkspace) return;
    setCreateParentPath(parentPath);
    setCreateType(type);
    setCreateName("");
    setShowCreateDialog(true);
  };

  const handleCreateFileOrFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !createName.trim()) return;

    const targetRelPath = createParentPath
      ? `${createParentPath}/${createName.trim()}`
      : createName.trim();

    try {
      await createFileOrFolder(activeWorkspace.id, targetRelPath, createType);
      toast.success(`Successfully created ${createType}`);
      setShowCreateDialog(false);
      setCreateName("");
      loadWorkspaceDetails(activeWorkspace.id);
    } catch (err: any) {
      toast.error(`Creation failed: ${err.message}`);
    }
  };

  const triggerRenameDialog = (filePath: string) => {
    if (!activeWorkspace) return;
    setRenameOldPath(filePath);
    const oldName = filePath.split("/").pop() || "";
    setRenameNewName(oldName);
    setShowRenameDialog(true);
  };

  const handleRenameFileOrFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !renameNewName.trim()) return;

    const parts = renameOldPath.split("/");
    parts.pop();
    const parentDir = parts.join("/");
    const targetNewPath = parentDir ? `${parentDir}/${renameNewName.trim()}` : renameNewName.trim();

    try {
      await renameFileOrFolder(activeWorkspace.id, renameOldPath, targetNewPath);
      toast.success("Renamed file tree node successfully");
      setShowRenameDialog(false);
      setRenameNewName("");
      if (activePath === renameOldPath) {
        setActivePath(targetNewPath);
      }
      loadWorkspaceDetails(activeWorkspace.id);
    } catch (err: any) {
      toast.error(`Rename failed: ${err.message}`);
    }
  };

  const handleDeleteFileOrFolder = async (filePath: string, fileKind: "file" | "folder") => {
    if (!activeWorkspace) return;
    if (confirm(`Are you sure you want to delete this ${fileKind} "${filePath}"?`)) {
      try {
        await deleteFileOrFolder(activeWorkspace.id, filePath);
        toast.success(`Deleted ${fileKind} successfully`);
        if (activePath === filePath) {
          setActivePath("");
        }
        loadWorkspaceDetails(activeWorkspace.id);
      } catch (err: any) {
        toast.error(`Delete failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-10 sm:px-6 sm:pt-8">
      {/* Hidden ZIP inputs */}
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleZipUpload}
        accept=".zip"
        style={{ display: "none" }}
      />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0E0E10] via-[#0C0C0E] to-[#0A0A0B] p-6 sm:p-7">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/30 to-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/15 to-cyan-300/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10.5px] tracking-[0.3em] text-white/40 uppercase">
              <Cpu className="h-3 w-3" />
              AI Coding Mode
            </div>
            <h1
              className="mt-2 truncate text-white"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, lineHeight: 1.05 }}
            >
              {activeWorkspace ? activeWorkspace.name : "No Workspace Connected"}
              {activeWorkspace && currentBranch && <span className="text-white/35"> / {currentBranch}</span>}
            </h1>
            <p className="mt-2 max-w-2xl text-[13.5px] text-white/55">
              {activeWorkspace
                ? "Pair with Nebula on real files. Build, debug, refactor, or explain — with your project memory and open files in scope."
                : "No workspace opened. Import or open a workspace to continue."}
            </p>
            {activeWorkspace && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {currentBranch && <Pill icon={GitBranch}>{currentBranch}</Pill>}
                <Pill icon={FileIcon}>{flatFiles.filter((f) => f.kind === "file").length} files</Pill>
                <Pill icon={Sparkles}>Gemini Pro</Pill>
                {problemCount > 0 && <Pill tone="warn" icon={AlertTriangle}>{problemCount} problems</Pill>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Workspace Select Dropdown */}
            <div className="relative">
              <button
                onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] text-white/80 transition hover:bg-white/[0.08]"
              >
                <FolderOpen className="h-3.5 w-3.5 text-violet-400" />
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {workspaceDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setWorkspaceDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 z-50 w-72 origin-top-right rounded-xl border border-white/[0.08] bg-[#0C0C0E]/95 p-1.5 shadow-2xl backdrop-blur-md">
                    <div className="px-2.5 py-1.5 text-[9px] tracking-wider text-white/40 uppercase font-semibold">
                      Switch Workspaces
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5 mt-1">
                      {workspaces.map((w) => (
                        <div
                          key={w.id}
                          onClick={() => {
                            setActiveWorkspace(w);
                            setWorkspaceDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12.5px] cursor-pointer transition ${
                            activeWorkspace?.id === w.id
                              ? "bg-white/[0.05] text-violet-300"
                              : "text-white/70 hover:bg-white/[0.03] hover:text-white"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-medium truncate">{w.name}</div>
                            <div className="text-[10px] text-white/30 truncate mt-0.5">{w.path}</div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteWorkspace(e, w.id, w.name)}
                            className="p-1 text-white/30 hover:text-rose-400 rounded transition"
                            title="Delete Workspace"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {workspaces.length === 0 && (
                        <div className="px-3 py-3 text-[11.5px] text-white/40 text-center">
                          No workspaces imported yet.
                        </div>
                      )}
                    </div>
                    <div className="border-t border-white/[0.06] mt-1.5 pt-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowImportDialog(true);
                          setWorkspaceDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-white/75 transition hover:bg-white/[0.04] hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5 text-white/50" />
                        Import Local Folder
                      </button>
                      <button
                        onClick={() => {
                          zipInputRef.current?.click();
                          setWorkspaceDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-white/75 transition hover:bg-white/[0.04] hover:text-white"
                      >
                        <Upload className="h-3.5 w-3.5 text-white/50" />
                        Upload ZIP Project
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {activeWorkspace && (
              <>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] text-white/80 transition hover:bg-white/[0.08]">
                  <Play className="h-3.5 w-3.5" />
                  Run tests
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-sky-400 px-3.5 py-2.5 text-[12.5px] text-[#0A0A0B] shadow-[0_10px_28px_-12px_rgba(139,92,246,0.7)] transition hover:brightness-110">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask Nebula
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {activeWorkspace ? (
        /* Workspace grid */
        <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
          {/* Tree Explorer */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between px-1.5 pb-2">
              <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Files</span>
              <button
                onClick={() => triggerCreateDialog("", "file")}
                className="rounded-md p-1 text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                title="Create in Root"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative mb-2">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input
                placeholder="Find in tree…"
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-1.5 pr-2 pl-7 text-[12px] text-white placeholder:text-white/30 focus:border-white/15 focus:outline-none"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                  <span className="text-[11.5px]">Loading files tree…</span>
                </div>
              ) : workspaceFiles.length === 0 ? (
                <div className="text-center py-20 text-[12px] text-white/40">
                  <p>Workspace is empty.</p>
                  <button
                    onClick={() => triggerCreateDialog("", "file")}
                    className="mt-2 text-violet-400 hover:underline"
                  >
                    Create a file
                  </button>
                </div>
              ) : (
                <Tree
                  nodes={workspaceFiles}
                  depth={0}
                  base=""
                  open={open}
                  setOpen={setOpen}
                  active={activePath}
                  setActive={setActivePath}
                  onCreate={triggerCreateDialog}
                  onRename={triggerRenameDialog}
                  onDelete={handleDeleteFileOrFolder}
                />
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-white/[0.06] bg-[#0A0A0B]/80">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.05] px-2 pt-2">
              {pinnedFiles.map((path) => {
                const isActive = path === activePath;
                const file = flatFiles.find((f) => f.path === path);
                return (
                  <button
                    key={path}
                    onClick={() => setActivePath(path)}
                    className={`group relative flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 text-[12px] whitespace-nowrap transition ${
                      isActive
                        ? "border-white/[0.08] bg-[#0E0E10] text-white"
                        : "border-transparent text-white/55 hover:text-white"
                    }`}
                  >
                    <FileIcon className="h-3 w-3 text-white/40" />
                    {file?.name ?? path.split("/").pop()}
                    {file?.status === "modified" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    )}
                    {file?.status === "new" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(path);
                      }}
                      className="ml-1 hidden text-white/30 transition hover:text-white group-hover:inline"
                    >
                      ×
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Editor surface */}
            <div className="relative flex-1 overflow-auto min-h-[300px]">
              {activeFile?.content ? (
                <pre
                  className="m-0 px-5 py-4 text-[12.5px] leading-[1.65] text-white/85"
                  style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                >
                  {activeFile.content.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-4 inline-block w-8 shrink-0 text-right text-white/25 tabular-nums select-none">
                        {i + 1}
                      </span>
                      <span className="whitespace-pre">{line || " "}</span>
                    </div>
                  ))}
                </pre>
              ) : (
                <div className="grid h-full place-items-center px-6 py-16 text-center text-[12.5px] text-white/45">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                      <FileIcon className="h-5 w-5 text-white/40" />
                    </div>
                    <p className="mt-3">No preview for this file yet.</p>
                    <p className="mt-1 text-white/30">Ask Nebula to scaffold it.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inline AI suggestion */}
            <AnimatePresence>
              {activeFile?.status === "modified" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="m-3 rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-sky-400/5 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-400">
                      <Sparkles className="h-3.5 w-3.5 text-[#0A0A0B]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-white/85">Nebula suggests</span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] tracking-[0.18em] text-white/55 uppercase">
                          line 18
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] text-white/65">
                        Wrap <code className="rounded bg-white/[0.06] px-1 py-px text-[11.5px]">advance</code> in a functional setState so it doesn't capture a stale <code className="rounded bg-white/[0.06] px-1 py-px text-[11.5px]">current</code> when called from async code.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="rounded-lg bg-white/90 px-3 py-1.5 text-[11.5px] text-[#0A0A0B] transition hover:bg-white">
                          Apply diff
                        </button>
                        <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-white/75 transition hover:bg-white/[0.08]">
                          Show changes
                        </button>
                        <button className="rounded-lg px-2 py-1.5 text-[11.5px] text-white/45 transition hover:text-white">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom panel */}
            <div className="border-t border-white/[0.05]">
              <div className="flex items-center gap-1 px-3 pt-2">
                {(["problems", "terminal"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBottom(b)}
                    className={`relative rounded-md px-2.5 py-1 text-[11px] tracking-[0.16em] uppercase transition ${
                      bottom === b ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {b}
                    {bottom === b && (
                      <motion.span
                        layoutId="code-bottom"
                        className="absolute right-2.5 -bottom-[7px] left-2.5 h-px bg-white/70"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="max-h-[180px] overflow-auto px-3 py-3">
                {bottom === "problems" ? (
                  <div className="space-y-1.5">
                    {PROBLEMS.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                      >
                        {p.kind === "error" ? (
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] text-white/85">{p.message}</div>
                          <div className="mt-0.5 text-[11px] text-white/40">
                            {p.file}:{p.line}
                          </div>
                        </div>
                        <button className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] text-white/70 transition hover:bg-white/[0.08]">
                          Fix with Nebula
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre
                    className="text-[11.5px] leading-[1.7] text-white/60"
                    style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                  >
                    {`$ pnpm test checkout
  ✓ advances from address → payment
  ✗ advances from payment → review
    Expected: "review"
    Received: "payment"
  1 failed, 1 passed`}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* AI Assistant Rail */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Mode</span>
                <span className="text-[10.5px] text-white/35">{activeMode.hint}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-[12px] transition ${
                        isActive
                          ? "border-white/15 bg-white/[0.05] text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-white/65 hover:text-white"
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br ${m.tint} ${isActive ? "opacity-100" : "opacity-70"}`}
                      >
                        <Icon className="h-3 w-3 text-[#0A0A0B]" strokeWidth={2.4} />
                      </span>
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">In context</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pinnedFiles.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-white/70"
                    >
                      <FileIcon className="h-3 w-3 text-white/40" />
                      {p.split("/").pop()}
                    </span>
                  ))}
                  <button className="rounded-md border border-dashed border-white/10 bg-transparent px-2 py-1 text-[11px] text-white/45 transition hover:text-white">
                    + add
                  </button>
                </div>
              </div>

              <label className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div>
                  <div className="text-[12px] text-white/85">Smart context</div>
                  <div className="text-[11px] text-white/45">Pull related files, types, and call sites automatically.</div>
                </div>
                <Toggle checked={smartContext} onChange={setSmartContext} label="Smart context" />
              </label>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0A0A0B] p-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "debug"
                      ? "Paste a stack trace, or describe the failing test…"
                      : mode === "refactor"
                        ? "Describe the shape you want this to become…"
                        : mode === "explain"
                          ? "Select code in the editor, or ask about a symbol…"
                          : "Describe the change. Nebula will use the files in context."
                  }
                  rows={4}
                  className="w-full resize-none bg-transparent text-[12.5px] text-white placeholder:text-white/30 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-white/40">
                    <CornerDownLeft className="h-3 w-3" />
                    to send
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 px-3 py-1.5 text-[11.5px] text-[#0A0A0B] transition hover:brightness-110">
                    <Send className="h-3 w-3" />
                    Send to {activeMode.label}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Snippets</span>
                <Terminal className="h-3.5 w-3.5 text-white/30" />
              </div>
              <div className="space-y-2">
                {SNIPPETS.map((s: any) => (
                  <div
                    key={s.title}
                    className="group rounded-xl border border-white/[0.05] bg-[#0A0A0B] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-white/85">{s.title}</span>
                      <button className="flex items-center gap-1 rounded-md p-1 text-white/35 transition hover:text-white">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <pre
                      className="mt-1.5 max-h-24 overflow-hidden text-[10.5px] leading-[1.55] text-white/55"
                      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                    >
                      {s.body}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0C0E]/70 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[10.5px] tracking-[0.22em] text-white/40 uppercase">Working tree</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/80" />
              </div>
              <ul className="space-y-1.5 text-[12px]">
                <li className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    useCheckoutMachine.ts
                  </span>
                  <span className="text-white/40">+8 −2</span>
                </li>
                <li className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    useCheckoutUrl.ts
                  </span>
                  <span className="text-white/40">+24</span>
                </li>
                <li className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    checkout.spec.ts
                  </span>
                  <span className="text-white/40">+6 −1</span>
                </li>
              </ul>
              <button className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/80 transition hover:bg-white/[0.08]">
                Open commit composer
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Welcome Workspace State */
        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0A0A0B]/60 p-16 text-center text-white/50 min-h-[400px] flex flex-col items-center justify-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl border border-white/[0.07] bg-white/[0.02] text-violet-400">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h2
            className="mt-6 text-white"
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28 }}
          >
            No Workspace Connected
          </h2>
          <p className="mt-2 max-w-sm text-[13px] text-white/40 leading-normal">
            No workspace opened. Import or open a workspace to continue.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                setImportPath("");
                setImportName("");
                setShowImportDialog(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-medium text-[#0A0A0B] transition hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5 text-[#0A0A0B]" strokeWidth={2.5} />
              Import Project
            </button>
            <button
              onClick={() => {
                setImportPath("");
                setImportName("");
                setShowImportDialog(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12.5px] text-white/85 transition hover:bg-white/[0.08]"
            >
              <FolderOpen className="h-3.5 w-3.5 text-white/60" />
              Open Local Folder
            </button>
            <button
              onClick={() => zipInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12.5px] text-white/85 transition hover:bg-white/[0.08]"
            >
              <Upload className="h-3.5 w-3.5 text-white/60" />
              Upload ZIP
            </button>
          </div>
        </div>
      )}

      {/* ─── MODALS & DIALOGS ────────────────────────────────────────── */}

      {/* Import Workspace Modal */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0E0E10] p-6 shadow-2xl">
            <h3 className="text-[17px] text-white font-medium">Import Workspace Folder</h3>
            <p className="text-[12px] text-white/45 mt-1.5 leading-normal">
              Provide the absolute pathway of a folder on your local machine to mount it as a workspace directory.
            </p>
            <form onSubmit={handleImport} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Folder Path</label>
                <input
                  value={importPath}
                  onChange={(e) => setImportPath(e.target.value)}
                  placeholder="e.g. D:\projects\checkout-flow"
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-white/15"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Custom Name (Optional)</label>
                <input
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="e.g. Checkout App"
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-white/15"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowImportDialog(false)}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-[12.5px] text-white/70 transition hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 px-4 py-2 text-[12.5px] font-medium text-[#0A0A0B] transition hover:brightness-110 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {importLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {importLoading ? "Importing…" : "Import Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create File/Folder Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0E0E10] p-6 shadow-2xl">
            <h3 className="text-[16px] text-white font-medium capitalize">
              Create New {createType}
            </h3>
            <p className="text-[12px] text-white/45 mt-1">
              Location: <span className="text-white/70">{createParentPath || "root"}</span>
            </p>
            <form onSubmit={handleCreateFileOrFolder} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Name</label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={createType === "file" ? "e.g. index.ts" : "e.g. components"}
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-white/15"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-[12.5px] text-white/70 transition hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 px-4 py-2 text-[12.5px] font-medium text-[#0A0A0B] transition hover:brightness-110"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename File/Folder Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0E0E10] p-6 shadow-2xl">
            <h3 className="text-[16px] text-white font-medium">Rename File Explorer Node</h3>
            <p className="text-[12px] text-white/45 mt-1 truncate">
              Original path: <span className="text-white/70">{renameOldPath}</span>
            </p>
            <form onSubmit={handleRenameFileOrFolder} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">New Name</label>
                <input
                  value={renameNewName}
                  onChange={(e) => setRenameNewName(e.target.value)}
                  placeholder="Enter new name"
                  className="mt-1 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-white/15"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameDialog(false)}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-[12.5px] text-white/70 transition hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-br from-violet-500 to-sky-400 px-4 py-2 text-[12.5px] font-medium text-[#0A0A0B] transition hover:brightness-110"
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function flatten(nodes: FileNode[], base = ""): { path: string; name: string; kind: FileNode["kind"]; content?: string; status?: FileNode["status"] }[] {
  const out: ReturnType<typeof flatten> = [];
  for (const n of nodes) {
    const path = base ? `${base}/${n.name}` : n.name;
    out.push({ path, name: n.name, kind: n.kind, content: n.content, status: n.status });
    if (n.children) out.push(...flatten(n.children, path));
  }
  return out;
}

function Tree({
  nodes,
  depth,
  base,
  open,
  setOpen,
  active,
  setActive,
  onCreate,
  onRename,
  onDelete,
}: {
  nodes: FileNode[];
  depth: number;
  base: string;
  open: Record<string, boolean>;
  setOpen: (v: Record<string, boolean>) => void;
  active: string;
  setActive: (p: string) => void;
  onCreate?: (parentPath: string, type: "file" | "folder") => void;
  onRename?: (path: string) => void;
  onDelete?: (path: string, kind: "file" | "folder") => void;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((n) => {
        const path = base ? `${base}/${n.name}` : n.name;
        if (n.kind === "folder") {
          const isOpen = !!open[path];
          return (
            <li key={path}>
              <div
                className="group flex w-full items-center justify-between rounded-md pr-1 text-[12px] text-white/70 transition hover:bg-white/[0.04] hover:text-white"
                style={{ paddingLeft: 6 + depth * 12 }}
              >
                <button
                  onClick={() => setOpen({ ...open, [path]: !isOpen })}
                  className="flex flex-1 items-center gap-1.5 py-1 text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-white/40" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-white/40" />
                  )}
                  <FolderOpen className="h-3.5 w-3.5 text-white/45" />
                  <span className="truncate">{n.name}</span>
                </button>
                <div className="hidden items-center gap-1.5 group-hover:flex shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCreate) onCreate(path, "file");
                    }}
                    className="p-0.5 text-white/45 transition hover:text-sky-300"
                    title="New File"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRename) onRename(path);
                    }}
                    className="p-0.5 text-white/45 transition hover:text-amber-300"
                    title="Rename Folder"
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(path, "folder");
                    }}
                    className="p-0.5 text-white/45 transition hover:text-rose-450"
                    title="Delete Folder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {isOpen && n.children && (
                <Tree
                  nodes={n.children}
                  depth={depth + 1}
                  base={path}
                  open={open}
                  setOpen={setOpen}
                  active={active}
                  setActive={setActive}
                  onCreate={onCreate}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              )}
            </li>
          );
        }
        const isActive = active === path;
        return (
          <li key={path}>
            <div
              className={`group flex w-full items-center justify-between rounded-md pr-1 transition ${
                isActive
                  ? "bg-white/[0.06] text-white font-medium"
                  : "text-white/65 hover:bg-white/[0.04] hover:text-white"
              }`}
              style={{ paddingLeft: 6 + depth * 12 + 14 }}
            >
              <button
                onClick={() => setActive(path)}
                className="flex-1 py-1 text-left truncate flex items-center gap-1.5 text-[12px]"
              >
                <FileIcon className="h-3 w-3 text-white/40 shrink-0" />
                <span className="truncate">{n.name}</span>
                {n.status === "modified" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-300 shrink-0" />
                )}
                {n.status === "new" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
              <div className="hidden items-center gap-1.5 group-hover:flex shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRename) onRename(path);
                  }}
                  className="p-0.5 text-white/45 transition hover:text-amber-300"
                  title="Rename File"
                >
                  <Edit2 className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(path, "file");
                  }}
                  className="p-0.5 text-white/45 transition hover:text-rose-450"
                  title="Delete File"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Pill({
  icon: Icon,
  tone = "default",
  children,
}: {
  icon?: typeof Sparkles;
  tone?: "default" | "warn";
  children: React.ReactNode;
}) {
  const tones =
    tone === "warn"
      ? "border-amber-300/25 bg-amber-300/[0.06] text-amber-100"
      : "border-white/[0.07] bg-white/[0.03] text-white/70";
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${tones}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
