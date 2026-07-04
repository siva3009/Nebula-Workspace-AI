import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "../hooks/useDebounce";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Settings,
  BookOpen,
  Folder,
  FolderOpen,
  Pin,
  Archive,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  Library,
  Command,
  Layers,
  Users,
  Brain,
  Code2,
  CalendarRange,
  X,
  Gauge,
} from "lucide-react";

export type ChatItem = {
  id: string;
  title: string;
  time: string;
  pinned?: boolean;
  archived?: boolean;
  folder?: string;
};

export type View = "chat" | "knowledge" | "admin" | "projects" | "team" | "memory" | "code" | "planner" | "analysis";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  chats: ChatItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  view: View;
  onView: (v: View) => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  isMobile?: boolean;
}

const FOLDERS = [
  { id: "engineering", name: "Engineering", color: "from-violet-400 to-fuchsia-400", count: 12 },
  { id: "research", name: "Research", color: "from-sky-400 to-cyan-300", count: 7 },
  { id: "writing", name: "Writing", color: "from-amber-300 to-rose-300", count: 4 },
];

export function Sidebar({
  open,
  onToggle,
  chats,
  activeId,
  onSelect,
  onNewChat,
  onOpenSettings,
  view,
  onView,
  onTogglePin,
  onArchive,
  isMobile,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [openFolder, setOpenFolder] = useState<string | null>("engineering");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );
  const pinned = filtered.filter((c) => c.pinned && !c.archived);
  const active = filtered.filter((c) => !c.pinned && !c.archived);
  const archived = filtered.filter((c) => c.archived);

  const grouped = {
    Today: active.slice(0, 2),
    Yesterday: active.slice(2, 4),
    "Last 7 days": active.slice(4),
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 296 : 72 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative z-30 flex h-full flex-col border-r border-white/[0.06] bg-[#0B0B0C]/85 backdrop-blur-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="lo"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-2.5"
            >
              <LogoMark />
              <div className="flex flex-col leading-none">
                <span className="text-[13px] tracking-[0.18em] text-white/90 uppercase">
                  Nebula
                </span>
                <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
                  Intelligence OS
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="lc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <LogoMark />
            </motion.div>
          )}
        </AnimatePresence>

        {open && (
          <button
            onClick={onToggle}
            title={isMobile ? "Close" : "Collapse"}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white/80"
          >
            {isMobile ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {!open && (
        <button
          onClick={onToggle}
          className="mx-auto mb-3 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white/80"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* New chat */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className="group relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-px transition hover:from-white/[0.1]"
        >
          <div className="flex items-center gap-3 rounded-[11px] bg-[#0E0E10] px-3 py-2.5">
            <div className="relative grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-sky-400 text-[#0A0A0B]">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            {open && (
              <>
                <span className="flex-1 text-left text-[13px] text-white/85">
                  New conversation
                </span>
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/40">
                  ⌘K
                </kbd>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Search */}
      {open && (
        <div className="mt-3 px-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-white/40 transition focus-within:border-white/15 focus-within:bg-white/[0.04]">
            <Search className="h-3.5 w-3.5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads, files, memory…"
              className="flex-1 bg-transparent text-[12.5px] text-white/85 outline-none placeholder:text-white/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-white/40 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary nav */}
      <div className="mt-4 px-3">
        {[
          { id: "chat" as View, icon: MessageSquare, label: "Conversations" },
          { id: "code" as View, icon: Code2, label: "Code" },
          { id: "projects" as View, icon: Layers, label: "Projects" },
          { id: "analysis" as View, icon: Gauge, label: "Analysis" },
          { id: "planner" as View, icon: CalendarRange, label: "Planner" },
          { id: "team" as View, icon: Users, label: "Team" },
          { id: "memory" as View, icon: Brain, label: "Memory" },
          { id: "knowledge" as View, icon: Library, label: "Knowledge" },
          { id: "admin" as View, icon: LayoutDashboard, label: "Control" },
        ].map((it) => (
          <NavRow
            key={it.id}
            open={open}
            active={view === it.id}
            onClick={() => onView(it.id)}
            icon={it.icon}
            label={it.label}
          />
        ))}
      </div>

      {open && view === "chat" && (
        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
          {/* Pinned */}
          {pinned.length > 0 && (
            <Section label="Pinned" icon={Pin}>
              {pinned.map((c) => (
                <ChatRow
                  key={c.id}
                  chat={c}
                  active={activeId === c.id}
                  onSelect={() => onSelect(c.id)}
                  onTogglePin={() => onTogglePin(c.id)}
                  onArchive={() => onArchive(c.id)}
                />
              ))}
            </Section>
          )}

          {/* Folders */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
              <span className="text-[10px] tracking-[0.22em] text-white/30 uppercase">
                Folders
              </span>
              <button className="text-white/30 hover:text-white">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {FOLDERS.map((f) => (
              <div key={f.id}>
                <button
                  onClick={() =>
                    setOpenFolder((cur) => (cur === f.id ? null : f.id))
                  }
                  className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-white/55 transition hover:bg-white/[0.03] hover:text-white"
                >
                  <ChevronRight
                    className={`h-3 w-3 transition ${openFolder === f.id ? "rotate-90" : ""}`}
                  />
                  {openFolder === f.id ? (
                    <FolderOpen className="h-3.5 w-3.5 opacity-70" />
                  ) : (
                    <Folder className="h-3.5 w-3.5 opacity-70" />
                  )}
                  <span className="flex-1 truncate text-left text-[12.5px]">
                    {f.name}
                  </span>
                  <span
                    className={`rounded-full bg-gradient-to-r ${f.color} bg-clip-text text-[10.5px] tabular-nums text-transparent opacity-80`}
                  >
                    {f.count}
                  </span>
                </button>
                <AnimatePresence>
                  {openFolder === f.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-6"
                    >
                      {chats
                        .filter((c) => !c.archived)
                        .slice(0, 2)
                        .map((c) => (
                          <ChatRow
                            key={`${f.id}-${c.id}`}
                            chat={c}
                            active={false}
                            compact
                            onSelect={() => onSelect(c.id)}
                            onTogglePin={() => onTogglePin(c.id)}
                            onArchive={() => onArchive(c.id)}
                          />
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Recent grouped */}
          {Object.entries(grouped).map(([label, items]) =>
            items.length ? (
              <Section key={label} label={label}>
                {items.map((c) => (
                  <ChatRow
                    key={c.id}
                    chat={c}
                    active={activeId === c.id}
                    onSelect={() => onSelect(c.id)}
                    onTogglePin={() => onTogglePin(c.id)}
                    onArchive={() => onArchive(c.id)}
                  />
                ))}
              </Section>
            ) : null,
          )}

          {/* Archived */}
          {archived.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowArchived((v) => !v)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[10.5px] tracking-[0.18em] text-white/30 uppercase transition hover:text-white/60"
              >
                <Archive className="h-3 w-3" />
                Archived ({archived.length})
                <ChevronRight
                  className={`ml-auto h-3 w-3 transition ${showArchived ? "rotate-90" : ""}`}
                />
              </button>
              <AnimatePresence>
                {showArchived && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden opacity-70"
                  >
                    {archived.map((c) => (
                      <ChatRow
                        key={c.id}
                        chat={c}
                        active={activeId === c.id}
                        onSelect={() => onSelect(c.id)}
                        onTogglePin={() => onTogglePin(c.id)}
                        onArchive={() => onArchive(c.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {open && view !== "chat" && (
        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
          <Section label={view === "knowledge" ? "Recent files" : "Workspace"}>
            <div className="px-2 text-[11.5px] leading-relaxed text-white/40">
              {view === "knowledge"
                ? "Files you upload appear here. Drag any document into the workspace to begin."
                : view === "analysis"
                  ? "Unified developer intelligence dashboard and static reports registry."
                  : "System monitoring and team controls. Switch back to chat anytime."}
            </div>
          </Section>
        </div>
      )}

      {!open && <div className="flex-1" />}

      {/* Footer */}
      <div className="border-t border-white/[0.05] p-3">
        {open && (
          <div className="mb-2 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] tracking-[0.18em] text-white/40 uppercase">
                Monthly usage
              </span>
              <span className="text-[10.5px] tabular-nums text-white/70">
                62%
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-violet-400 to-sky-400" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-white/35">
              <span>620K / 1M tokens</span>
              <button className="text-violet-300/80 hover:text-violet-200">
                Upgrade
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2 transition hover:bg-white/[0.05]"
        >
          <div className="relative h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-500/80 via-fuchsia-500/60 to-sky-400/80 p-px">
            <div className="grid h-full w-full place-items-center rounded-[7px] bg-[#0E0E10] text-[11px] text-white/90">
              AK
            </div>
          </div>
          {open && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-[12.5px] text-white/90">
                  Alex Kowalski
                </div>
                <div className="text-[10.5px] text-white/40">Pro · Workspace</div>
              </div>
              <Settings className="h-4 w-4 text-white/40" />
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1.5">
        {Icon && <Icon className="h-3 w-3 text-white/30" />}
        <span className="text-[10px] tracking-[0.22em] text-white/30 uppercase">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function NavRow({
  open,
  active,
  onClick,
  icon: Icon,
  label,
}: {
  open: boolean;
  active?: boolean;
  onClick?: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
        active
          ? "bg-white/[0.06] text-white"
          : "text-white/55 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-nav"
          className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-violet-400 to-sky-400"
        />
      )}
      <Icon className="h-4 w-4" />
      {open && <span className="flex-1 text-left">{label}</span>}
    </button>
  );
}

function ChatRow({
  chat,
  active,
  compact,
  onSelect,
  onTogglePin,
  onArchive,
}: {
  chat: ChatItem;
  active: boolean;
  compact?: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onArchive: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="group/row relative">
      <button
        onClick={onSelect}
        className={`relative flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition ${
          active
            ? "bg-white/[0.06] text-white"
            : "text-white/55 hover:bg-white/[0.03] hover:text-white/95"
        }`}
      >
        {active && (
          <motion.span
            layoutId="active-chat"
            className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-violet-400 to-sky-400"
          />
        )}
        {chat.pinned ? (
          <Pin className="mt-0.5 h-3 w-3 shrink-0 fill-violet-300/60 text-violet-300/80" />
        ) : (
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
        )}
        <div className="min-w-0 flex-1">
          <div
            className={`truncate ${compact ? "text-[12px]" : "text-[12.5px]"}`}
          >
            {chat.title}
          </div>
          {!compact && (
            <div className="text-[10.5px] text-white/30">{chat.time}</div>
          )}
        </div>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenu((v) => !v);
        }}
        className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-md text-white/40 opacity-0 transition hover:bg-white/10 hover:text-white group-hover/row:opacity-100"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-8 right-1 z-20 w-44 overflow-hidden rounded-lg border border-white/[0.08] bg-[#15151A]/95 p-1 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur"
          >
            <MenuItem
              icon={Pin}
              label={chat.pinned ? "Unpin" : "Pin to top"}
              onClick={() => {
                onTogglePin();
                setMenu(false);
              }}
            />
            <MenuItem icon={Pencil} label="Rename" onClick={() => setMenu(false)} />
            <MenuItem
              icon={Archive}
              label={chat.archived ? "Unarchive" : "Archive"}
              onClick={() => {
                onArchive();
                setMenu(false);
              }}
            />
            <div className="my-1 h-px bg-white/[0.06]" />
            <MenuItem
              icon={Trash2}
              label="Delete"
              danger
              onClick={() => setMenu(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] transition ${
        danger
          ? "text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200"
          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function LogoMark() {
  return (
    <div className="relative h-7 w-7 shrink-0">
      <div className="absolute inset-0 rounded-[8px] bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400 opacity-90 blur-[6px]" />
      <div className="relative grid h-7 w-7 place-items-center rounded-[8px] bg-gradient-to-br from-violet-500 via-fuchsia-400 to-sky-400">
        <div className="h-3 w-3 rotate-45 rounded-[2px] bg-[#0A0A0B]" />
      </div>
    </div>
  );
}

// silence unused
void Sparkles;
void BookOpen;
void Command;
