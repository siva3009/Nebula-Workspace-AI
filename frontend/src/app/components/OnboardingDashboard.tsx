import React from "react";
import { motion } from "motion/react";
import {
  FolderPlus,
  Link as LinkIcon,
  UploadCloud,
  MessageSquare,
  Gauge,
  BookOpen,
} from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color: string;
  delay: number;
}

function ActionCard({ title, description, icon: Icon, onClick, color, delay }: ActionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${color} blur-2xl opacity-40 transition group-hover:opacity-100`}
      />
      <div className="relative flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/80 transition group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-white/90">{title}</div>
          <div className="mt-1 text-[12px] leading-relaxed text-white/45">
            {description}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function OnboardingDashboard({
  onCreateProject,
  onConnectWorkspace,
  onUploadKnowledge,
  onStartChat,
  onRunAnalysis,
  onViewDocs,
}: {
  onCreateProject: () => void;
  onConnectWorkspace: () => void;
  onUploadKnowledge: () => void;
  onStartChat: () => void;
  onRunAnalysis: () => void;
  onViewDocs: () => void;
}) {
  const actions = [
    {
      title: "Start AI Chat",
      description: "Begin a new conversation with Nebula Opus for coding or reasoning.",
      icon: MessageSquare,
      color: "from-violet-500/30 to-violet-500/0",
      onClick: onStartChat,
    },
    {
      title: "Run First Analysis",
      description: "Scan your codebase for bugs, security risks, and architecture insights.",
      icon: Gauge,
      color: "from-rose-400/30 to-rose-400/0",
      onClick: onRunAnalysis,
    },
    {
      title: "Create Project",
      description: "Organize your tasks, plans, and workspace into a new project.",
      icon: FolderPlus,
      color: "from-sky-400/30 to-sky-400/0",
      onClick: onCreateProject,
    },
    {
      title: "Connect Workspace",
      description: "Link a local directory to allow Nebula to read and modify files.",
      icon: LinkIcon,
      color: "from-emerald-400/30 to-emerald-400/0",
      onClick: onConnectWorkspace,
    },
    {
      title: "Upload Knowledge",
      description: "Provide documents to give Nebula context about your domain.",
      icon: UploadCloud,
      color: "from-fuchsia-400/30 to-fuchsia-400/0",
      onClick: onUploadKnowledge,
    },
    {
      title: "View Documentation",
      description: "Learn how to use all the features of the Nebula platform.",
      icon: BookOpen,
      color: "from-amber-400/30 to-amber-400/0",
      onClick: onViewDocs,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 pt-20 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mx-auto flex w-max items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] tracking-[0.18em] text-white/55 uppercase backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Nebula v1.0 RC1
        </div>
        <h1
          className="mt-8 text-white/95"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(42px, 5vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to Nebula
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/45">
          Your premium reasoning workspace is ready. Pick an action below to get started and see what Nebula can do.
        </p>
      </motion.div>

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, i) => (
          <ActionCard key={action.title} {...action} delay={0.2 + i * 0.05} />
        ))}
      </div>
    </div>
  );
}
