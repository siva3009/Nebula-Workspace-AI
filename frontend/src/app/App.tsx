import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import {
  Share2,
  MoreHorizontal,
  Sparkles,
  ChevronDown,
  ArrowDown,
  Search,
  PanelRightOpen,
  PanelRightClose,
  Menu,
} from "lucide-react";

import { AmbientBackground } from "./components/AmbientBackground";
import { Sidebar, type ChatItem, type View } from "./components/Sidebar";
import { WelcomeHero } from "./components/WelcomeHero";
import { OnboardingDashboard } from "./components/OnboardingDashboard";
import { Composer } from "./components/Composer";
import { Message, type ChatMessage } from "./components/Message";
import { ModelSelector, MODELS } from "./components/ModelSelector";
import { SettingsPanel } from "./components/SettingsPanel";
import { DropZone } from "./components/DropZone";
import { MessageSkeleton, ThinkingPulse } from "./components/Skeleton";
import { CommandPalette } from "./components/CommandPalette";
import { DetailsPanel } from "./components/DetailsPanel";
import { AttachmentTray, type Attachment } from "./components/AttachmentTray";
import { ContextRail } from "./components/ContextRail";
import { AIRouter } from "./components/AIRouter";
import { PROJECTS as _P } from "./mock/devFixtures";
const PROJECTS = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' ? _P : [];

// Lazy-loaded workspace components
const KnowledgePanel = lazy(() => import("./components/KnowledgePanel").then(m => ({ default: m.KnowledgePanel })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AnalysisDashboard = lazy(() => import("./components/AnalysisDashboard").then(m => ({ default: m.AnalysisDashboard })));
const ProfilePage = lazy(() => import("./components/ProfilePage").then(m => ({ default: m.ProfilePage })));
const ProjectsHub = lazy(() => import("./components/ProjectsHub").then(m => ({ default: m.ProjectsHub })));
const ProjectWorkspace = lazy(() => import("./components/ProjectWorkspace").then(m => ({ default: m.ProjectWorkspace })));
const TeamWorkspace = lazy(() => import("./components/TeamWorkspace").then(m => ({ default: m.TeamWorkspace })));
const MemoryLibrary = lazy(() => import("./components/MemoryLibrary").then(m => ({ default: m.MemoryLibrary })));
const CodingWorkspace = lazy(() => import("./components/CodingWorkspace").then(m => ({ default: m.CodingWorkspace })));
const PlannerWorkspace = lazy(() => import("./components/PlannerWorkspace").then(m => ({ default: m.PlannerWorkspace })));
import { UserSessionSwitcher } from "./components/ui/UserSessionSwitcher";
import {
  fetchConversations,
  createConversation,
  fetchConversationDetails,
  sendConversationMessage,
  formatTime,
  mapBackendMessageToFrontend,
  parseMarkdownToBlocks,
  uploadFile,
  fetchKnowledgeFiles,
} from "./services/chatService";

import { INITIAL_CHATS as _INITIAL_CHATS, LONG_THREAD as _LONG_THREAD } from "./mock/devFixtures";
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
const INITIAL_CHATS = isDemoMode ? _INITIAL_CHATS : [];
const LONG_THREAD = isDemoMode ? _LONG_THREAD : [];

const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center py-20 text-white/40">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeChat, setActiveChat] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelId, setModelId] = useState("ollama-llama3");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const [view, setView] = useState<View | "profile">("chat");
  const [dragging, setDragging] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [routerOpen, setRouterOpen] = useState(false);
  const [smartRouting, setSmartRouting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const modelName = MODELS.find((m) => m.id === modelId)?.name ?? "Nebula";
  const ctxUsed = Math.min(0.18 + messages.length * 0.04, 0.95);

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 900;
      setIsMobile(m);
      if (m) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (atBottom) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typing, atBottom]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      } else if (meta && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      } else if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newChat();
      } else if (meta && e.key === "/") {
        e.preventDefault();
        setDetailsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingThread(true);
      try {
        const backendConversations = await fetchConversations();
        if (backendConversations.length > 0) {
          const mappedConversations = backendConversations.map((c) => ({
            id: c.id,
            title: c.title,
            time: c.updatedAt ? formatTime(c.updatedAt) : "now",
            pinned: false,
            archived: false,
          }));
          setChats(mappedConversations);

          // Select the first conversation
          const firstId = mappedConversations[0].id;
          setActiveChat(firstId);
          setShowWelcome(false);

          const details = await fetchConversationDetails(firstId);
          const mappedMessages = details.messages.map(mapBackendMessageToFrontend);
          setMessages(mappedMessages);
        } else {
          setChats([]);
          setMessages([]);
          setShowWelcome(true);
        }
      } catch (error: any) {
        toast.error(`Failed to load chat history: ${error.message}`);
        setChats([]);
        setMessages([]);
        setShowWelcome(true);
      } finally {
        setLoadingThread(false);
      }
    };
    loadInitialData();
  }, []);


  const startUpload = async (file: File) => {
    const clientId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const kind: Attachment["kind"] = file.type.startsWith("image/")
      ? "image"
      : file.name.endsWith(".pdf")
        ? "pdf"
        : /\.(tsx?|jsx?|py|go|rs|css|md)$/.test(file.name)
          ? "code"
          : "doc";

    setAttachments((xs) => [
      ...xs,
      { id: clientId, name: file.name, size: formatBytes(file.size), kind, progress: 4 },
    ]);

    try {
      // Upload file to backend
      const result = await uploadFile(file);
      const backendFileId = result.id;

      // Mark as uploaded (50%) — now indexing on backend
      setAttachments((xs) =>
        xs.map((a) => (a.id === clientId ? { ...a, progress: 50 } : a)),
      );

      // Poll for READY status
      const pollInterval = window.setInterval(async () => {
        try {
          const files = await fetchKnowledgeFiles();
          const match = files.find((f: any) => f.id === backendFileId);
          if (match && match.status === "READY") {
            window.clearInterval(pollInterval);
            setAttachments((xs) =>
              xs.map((a) => (a.id === clientId ? { ...a, progress: 100 } : a)),
            );
            toast.success(`${file.name} indexed and ready`);
          } else if (match && match.status === "ERROR") {
            window.clearInterval(pollInterval);
            setAttachments((xs) => xs.filter((a) => a.id !== clientId));
            toast.error(`Failed to index ${file.name}`);
          }
        } catch {
          // Silently retry on next interval
        }
      }, 1500);
    } catch (error: any) {
      setAttachments((xs) => xs.filter((a) => a.id !== clientId));
      toast.error(`Upload failed: ${error.message || file.name}`);
    }
  };

  const handleAttachFiles = (files: File[]) => {
    files.forEach((f) => startUpload(f));
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 80);
  };

  const send = async (text: string) => {
    setShowWelcome(false);
    setView("chat");
    const attachedNote =
      attachments.length > 0
        ? `\n\n_Attached: ${attachments.map((a) => a.name).join(", ")}_`
        : "";
    const userMsgContent = text + attachedNote;
    const u: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      time: "now",
      blocks: [{ type: "text", content: userMsgContent }],
    };
    
    const updatedMessages = [...messages, u];
    setMessages(updatedMessages);
    setAttachments([]);
    setTyping(true);

    try {
      let currentId = activeChat;
      
      // Lazily create the conversation if we are on a fresh chat or if no conversations exist yet
      if (!currentId || chats.length === 0 || currentId.startsWith("temp-") || !chats.some(c => c.id === currentId)) {
        const title = text.length > 35 ? text.slice(0, 35) + "..." : text;
        const newConv = await createConversation(title);
        currentId = newConv.id;
        setActiveChat(currentId);
        
        const newChatItem = {
          id: currentId,
          title,
          time: "now",
        };
        setChats((cs) => [newChatItem, ...cs]);
      }

      const responseData = await sendConversationMessage(currentId, text);
      setTyping(false);
      
      const aiMessage: ChatMessage = {
        id: responseData.id,
        role: "ai",
        time: "now",
        tokens: responseData.metadata?.evalCount || undefined,
        blocks: parseMarkdownToBlocks(responseData.content),
      };

      setMessages([...updatedMessages, aiMessage]);

      // Update sidebar timestamp and title if it was named default
      setChats((cs) =>
        cs.map((c) => {
          if (c.id === currentId) {
            return {
              ...c,
              title: c.title === "New conversation" 
                ? (text.length > 35 ? text.slice(0, 35) + "..." : text) 
                : c.title,
              time: "now",
            };
          }
          return c;
        })
      );
    } catch (error: any) {
      setTyping(false);
      toast.error(`AI Error: ${error.message || "Failed to get response"}`);
      
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "ai",
        time: "now",
        blocks: [
          {
            type: "text",
            content: `⚠️ **Connection Error**\n\nFailed to get a response from Nebula backend:\n\n*${error.message || "Please make sure your backend server is running on http://localhost:4000"}*`,
          },
        ],
      };

      setMessages([...updatedMessages, errorMsg]);
    }
  };

  const newChat = () => {
    setLoadingThread(true);
    setView("chat");
    setMessages([]);
    
    // Assign a temporary new ID so the system knows it's uncreated
    setActiveChat(`temp-${Date.now()}`);

    setTimeout(() => {
      setLoadingThread(false);
      setShowWelcome(true);
    }, 600);
  };

  const onSelectChat = async (id: string) => {
    if (id === activeChat) return;

    setActiveChat(id);
    setLoadingThread(true);
    setShowWelcome(false);
    setView("chat");

    try {
      const details = await fetchConversationDetails(id);
      const mapped = details.messages.map(mapBackendMessageToFrontend);
      setMessages(mapped);
      setShowWelcome(mapped.length === 0);
    } catch (error: any) {
      toast.error(`Failed to load conversation: ${error.message}`);
      setMessages([]);
      setShowWelcome(true);
    } finally {
      setLoadingThread(false);
    }

    if (isMobile) setSidebarOpen(false);
  };



  const togglePin = (id: string) =>
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  const toggleArchive = (id: string) =>
    setChats((cs) =>
      cs.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    );

  // Drag and drop
  const onDragEnter = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    dragCounter.current += 1;
    setDragging(true);
  };
  const onDragLeave = () => {
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.forEach((f) => startUpload(f));
    }
    if (view !== "chat") setView("chat");
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative h-screen w-full overflow-hidden bg-[#0A0A0B] text-white"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <AmbientBackground />

      <div className="relative z-10 flex h-full w-full">
        {/* Desktop sidebar */}
        {!isMobile && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            chats={chats}
            activeId={activeChat}
            onSelect={onSelectChat}
            onNewChat={newChat}
            onOpenSettings={() => setSettingsOpen(true)}
            view={view === "profile" ? "chat" : (view as View)}
            onView={(v) => setView(v)}
            onTogglePin={togglePin}
            onArchive={toggleArchive}
            onOpenProfile={() => setView("profile")}
            onOpenCommand={() => setCommandOpen(true)}
          />
        )}

        {/* Mobile sidebar drawer */}
        {isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  key="scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  key="drawer"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 280, damping: 32 }}
                  className="fixed top-0 left-0 z-30 h-full"
                >
                  <Sidebar
                    open
                    onToggle={() => setSidebarOpen(false)}
                    chats={chats}
                    activeId={activeChat}
                    onSelect={onSelectChat}
                    onNewChat={() => {
                      newChat();
                      setSidebarOpen(false);
                    }}
                    onOpenSettings={() => setSettingsOpen(true)}
                    view={view === "profile" ? "chat" : (view as View)}
                    onView={(v) => {
                      setView(v);
                      setSidebarOpen(false);
                    }}
                    onTogglePin={togglePin}
                    onArchive={toggleArchive}
                    onOpenProfile={() => {
                      setView("profile");
                      setSidebarOpen(false);
                    }}
                    onOpenCommand={() => {
                      setCommandOpen(true);
                      setSidebarOpen(false);
                    }}
                    isMobile
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Main */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/[0.05] bg-[#0A0A0B]/50 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}

              {view === "chat" ? (
                <>
                  <button
                    onClick={() => setModelOpen(true)}
                    className="group flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 transition hover:bg-white/[0.05]"
                  >
                    <div className="relative h-5 w-5">
                      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-400 to-sky-400 blur-md opacity-70" />
                      <div className="relative grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-violet-400 to-sky-400">
                        <Sparkles className="h-3 w-3 text-[#0A0A0B]" strokeWidth={2.4} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] text-white/90">{modelName}</span>
                      <span className="hidden text-[10.5px] tracking-[0.16em] text-white/35 uppercase sm:inline">
                        Reasoning
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-white/40 transition group-hover:text-white/70" />
                  </button>

                  <div className="hidden min-w-0 items-center gap-2 lg:flex">
                    <span className="text-white/15">/</span>
                    <span className="max-w-[280px] truncate text-[12.5px] text-white/65">
                      {chats.find((c) => c.id === activeChat)?.title ??
                        "New conversation"}
                    </span>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (view === "projects" && activeProjectId) {
                      setActiveProjectId(null);
                    } else {
                      setView("chat");
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white/[0.04]"
                >
                  <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                    {view === "knowledge"
                      ? "Workspace"
                      : view === "admin"
                        ? "Control"
                        : view === "projects"
                          ? "Workspace"
                          : view === "team"
                            ? "Workspace"
                            : view === "memory"
                              ? "Intelligence"
                              : view === "code"
                                ? "Engineering"
                                : view === "planner"
                                  ? "Productivity"
                                  : "Account"}
                  </span>
                  <span className="text-white/15">/</span>
                  <span className="text-[13px] text-white/85">
                    {view === "knowledge"
                      ? "Knowledge"
                      : view === "admin"
                        ? "Mission control"
                        : view === "projects"
                          ? activeProjectId
                            ? PROJECTS.find((p) => p.id === activeProjectId)?.name ?? "Project"
                            : "Projects"
                          : view === "team"
                            ? "Team"
                            : view === "memory"
                              ? "Memory & Knowledge"
                              : view === "code"
                                ? "Coding workspace"
                                : view === "planner"
                                  ? "Planner & sprints"
                                  : "Profile"}
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <UserSessionSwitcher onUserChange={setCurrentUser} />
              {view === "chat" && (
                <div
                  className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 md:flex"
                  title="Context window used"
                >
                  <span className="text-[10.5px] tracking-[0.16em] text-white/40 uppercase">
                    Context
                  </span>
                  <div className="relative h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.span
                      initial={false}
                      animate={{ width: `${ctxUsed * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 to-sky-400"
                    />
                  </div>
                  <span className="text-[10.5px] tabular-nums text-white/55">
                    {Math.round(ctxUsed * 100)}%
                  </span>
                </div>
              )}

              <button
                title="Search · ⌘K"
                onClick={() => setCommandOpen(true)}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
              {view === "chat" && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://nebula.ai/c/" + activeChat);
                    toast.success("Share link copied");
                  }}
                  className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12px] text-white/70 transition hover:bg-white/[0.05] hover:text-white sm:flex"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              )}
              {view === "chat" && (
                <button
                  title={detailsOpen ? "Hide details · ⌘/" : "Show details · ⌘/"}
                  onClick={() => setDetailsOpen((v) => !v)}
                  className={`hidden rounded-lg p-2 transition sm:block ${
                    detailsOpen
                      ? "bg-white/[0.06] text-white"
                      : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {detailsOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </button>
              )}
              <button className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.05] hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Main content area */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="relative flex-1 overflow-y-auto"
          >
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                {view === "profile" ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <ProfilePage onOpenSettings={() => setSettingsOpen(true)} />
                </motion.div>
              ) : view === "projects" ? (
                activeProjectId ? (
                  <motion.div
                    key={`project-${activeProjectId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32 }}
                  >
                    <ProjectWorkspace
                      projectId={activeProjectId}
                      onBack={() => setActiveProjectId(null)}
                      onOpenThread={() => {
                        setView("chat");
                        setActiveProjectId(null);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="projects-hub"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32 }}
                  >
                    <ProjectsHub onOpenProject={(id) => setActiveProjectId(id)} />
                  </motion.div>
                )
              ) : view === "team" ? (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32 }}
                >
                  <TeamWorkspace
                    onOpenProject={(id) => {
                      setView("projects");
                      setActiveProjectId(id);
                    }}
                  />
                </motion.div>
              ) : view === "planner" ? (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32 }}
                >
                  <PlannerWorkspace />
                </motion.div>
              ) : view === "code" ? (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32 }}
                >
                  <CodingWorkspace />
                </motion.div>
              ) : view === "memory" ? (
                <motion.div
                  key="memory"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32 }}
                >
                  <MemoryLibrary />
                </motion.div>
              ) : view === "knowledge" ? (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <KnowledgePanel />
                </motion.div>
              ) : view === "analysis" ? (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <AnalysisDashboard currentUser={currentUser} />
                </motion.div>
              ) : view === "admin" ? (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <AdminPanel />
                </motion.div>
              ) : loadingThread ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto w-full max-w-3xl space-y-10 px-6 pt-10 pb-10"
                >
                  <MessageSkeleton />
                  <MessageSkeleton />
                </motion.div>
              ) : isFirstRun ? (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <OnboardingDashboard
                    onCreateProject={() => { setIsFirstRun(false); setView("projects"); }}
                    onConnectWorkspace={() => { setIsFirstRun(false); setView("projects"); }}
                    onUploadKnowledge={() => { setIsFirstRun(false); setView("knowledge"); }}
                    onStartChat={() => { setIsFirstRun(false); setShowWelcome(true); setView("chat"); }}
                    onRunAnalysis={() => { setIsFirstRun(false); setView("analysis"); }}
                    onViewDocs={() => { setIsFirstRun(false); window.open("https://github.com", "_blank"); }}
                  />
                </motion.div>
              ) : showWelcome || messages.length === 0 ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <WelcomeHero onPick={send} />
                </motion.div>
              ) : (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto w-full max-w-3xl space-y-10 px-4 pt-8 pb-10 sm:px-6 sm:pt-10"
                >
                  <DaySeparator label="Today · 2 Jun" />
                  {messages.map((m, i) => (
                    <Message key={m.id} message={m} index={i} />
                  ))}
                  {typing && <ThinkingPulse />}
                  <div className="h-2" />
                </motion.div>
              )}
              </AnimatePresence>
            </Suspense>
          </div>

          {/* Composer — only when in chat view */}
          {view === "chat" && (
            <div className="relative">
              <div className="pointer-events-none absolute -top-16 right-0 left-0 h-16 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />

              <AnimatePresence>
                {!atBottom && !showWelcome && !loadingThread && (
                  <motion.button
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                    className="absolute -top-12 left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-white/10 bg-[#15151A]/90 text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur transition hover:text-white"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {!showWelcome && !loadingThread && messages.length > 0 && (
                <div className="pb-2">
                  <ContextRail modelName={modelName} />
                </div>
              )}

              <AttachmentTray
                items={attachments}
                onRemove={(id) =>
                  setAttachments((xs) => xs.filter((a) => a.id !== id))
                }
              />

              <Composer
                onSend={send}
                onOpenModel={() => setModelOpen(true)}
                onAttachFiles={handleAttachFiles}
                modelName={modelName}
              />
            </div>
          )}
        </main>

        {view === "chat" && (
          <DetailsPanel
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            threadTitle={
              chats.find((c) => c.id === activeChat)?.title ?? "Untitled"
            }
            modelName={modelName}
          />
        )}
      </div>

      <ModelSelector
        open={modelOpen}
        selected={modelId}
        onSelect={setModelId}
        onClose={() => setModelOpen(false)}
      />
      <AIRouter
        open={routerOpen}
        selectedId={modelId}
        smartRouting={smartRouting}
        onSmartRouting={setSmartRouting}
        onSelect={(id) => {
          setModelId(id);
          toast.success(`Routed to ${id}`);
        }}
        onClose={() => setRouterOpen(false)}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DropZone active={dragging} />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        chats={chats}
        onSelectChat={onSelectChat}
        onView={(v) => setView(v)}
        onNewChat={newChat}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenModel={() => setModelOpen(true)}
        onSelectModel={(id) => {
          setModelId(id);
          const m = MODELS.find((x) => x.id === id);
          if (!m) return;
          toast.success(`Switched to ${m.name}`, { description: "Running on-device" });
        }}
        onOpenProfile={() => setView("profile")}
      />

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(15,15,17,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </div>
  );
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function DaySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10.5px] tracking-[0.22em] text-white/45 uppercase backdrop-blur">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
    </div>
  );
}
