import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  ClipboardList,
  Activity,
  Send,
  Trash2,
  Check,
  UserPlus,
  Share2,
  Globe,
  Lock,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchComments,
  createComment,
  deleteComment,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchActivityTimeline,
  toggleReportShare,
  fetchUsers,
} from "../../services/chatService";

interface Props {
  data: any; // UnifiedAnalysisResponseDto
  currentUser: any;
}

interface CommentRowProps {
  comment: any;
  currentUser: any;
  onPostReply: (parentId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string, parentId?: string) => Promise<void>;
}

const CommentRow = React.memo(function CommentRow({
  comment,
  currentUser,
  onPostReply,
  onDeleteComment,
}: CommentRowProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await onPostReply(comment.id, replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div className="space-y-2">
      <div className="group relative rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${comment.user?.avatar || "from-violet-500 to-sky-400"} text-[11px] text-[#0A0A0B] font-semibold`}>
              {comment.user?.name?.split(" ").map((n: string) => n[0]).join("") || comment.user?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[12.5px] font-medium text-white/95">{comment.user?.name}</span>
              <span className="text-[9.5px] text-white/35 block mt-0.5">{comment.user?.title}</span>
            </div>
          </div>
          <span className="text-[10.5px] text-white/35 shrink-0">
            {new Date(comment.createdAt).toLocaleDateString()} · {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="mt-3.5 text-[13px] leading-relaxed text-white/80 pl-10.5">
          {comment.content}
        </p>

        <div className="mt-3.5 pl-10.5 flex items-center gap-3 text-[11px]">
          <button
            onClick={() => {
              setShowReplyForm(!showReplyForm);
              setReplyText("");
            }}
            className="text-sky-400 hover:text-sky-300 font-medium"
          >
            Reply
          </button>
          {currentUser && (comment.userId === currentUser.id || currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
            <button
              onClick={() => onDeleteComment(comment.id)}
              className="text-rose-400/80 hover:text-rose-300 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Reply list nested */}
      {comment.replies && comment.replies.map((reply: any) => (
        <div key={reply.id} className="ml-10 rounded-xl border border-white/[0.03] bg-white/[0.005] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`grid h-6.5 w-6.5 place-items-center rounded-full bg-gradient-to-br ${reply.user?.avatar || "from-violet-500 to-sky-400"} text-[9px] text-[#0A0A0B] font-semibold`}>
                {reply.user?.name?.split(" ").map((n: string) => n[0]).join("") || reply.user?.username?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[12px] font-medium text-white/95">{reply.user?.name}</span>
                <span className="text-[9px] text-white/35 block mt-0.5">{reply.user?.title}</span>
              </div>
            </div>
            <span className="text-[10px] text-white/35 shrink-0">
              {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/75 pl-8.5">
            {reply.content}
          </p>

          {currentUser && (reply.userId === currentUser.id || currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
            <div className="mt-1.5 pl-8.5">
              <button
                onClick={() => onDeleteComment(reply.id, comment.id)}
                className="text-rose-400/80 hover:text-rose-300 text-[11px] font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Inline reply form input */}
      {showReplyForm && (
        <div className="ml-10 flex items-center gap-2 p-1.5 rounded-lg border border-white/[0.05] bg-white/[0.01]">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.user?.name || "thread"}...`}
            className="flex-1 bg-transparent px-2.5 py-1 text-[12px] text-white outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendReply();
              }
            }}
          />
          <button
            disabled={!replyText.trim()}
            onClick={handleSendReply}
            className="rounded-lg p-1.5 text-sky-400 transition hover:bg-white/[0.05] disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

interface TaskRowProps {
  task: any;
  onToggleStatus: (task: any) => void;
  onDeleteTask: (id: string) => void;
}

const TaskRow = React.memo(function TaskRow({
  task,
  onToggleStatus,
  onDeleteTask,
}: TaskRowProps) {
  const isResolved = task.status === "RESOLVED";
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] transition">
      <div className="flex items-start gap-2.5 min-w-0">
        <button
          onClick={() => onToggleStatus(task)}
          className={`mt-0.5 grid h-4.5 w-4.5 place-items-center rounded border transition shrink-0 ${
            isResolved
              ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
              : "border-white/20 hover:border-violet-400/40"
          }`}
        >
          {isResolved && <Check className="h-3 w-3" />}
        </button>
        <div className="min-w-0">
          <span className={`text-[12.5px] block font-medium leading-tight ${isResolved ? "line-through text-white/35" : "text-white/90"}`}>
            {task.title}
          </span>
          <span className="text-[10px] text-white/35 mt-1 block truncate">
            {task.assignee ? `Assigned to: ${task.assignee.name}` : "Unassigned"}
            {task.filePath ? ` · In ${task.filePath.split("/").pop()}` : ""}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDeleteTask(task.id)}
        className="rounded-lg p-1 text-white/30 hover:bg-white/[0.05] hover:text-rose-400 transition"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

interface ActivityRowProps {
  act: any;
  formatActivityLog: (act: any) => any;
}

const ActivityRow = React.memo(function ActivityRow({
  act,
  formatActivityLog,
}: ActivityRowProps) {
  const format = formatActivityLog(act);
  const Icon = format.icon;
  return (
    <div className="flex gap-3 items-start">
      <div className={`grid h-7 w-7 place-items-center rounded-lg ${format.color} shrink-0`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-snug text-white/85 font-medium">
          {format.text}
        </p>
        <span className="text-[10px] text-white/35 block mt-0.5">
          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});

export function CollaborationTab({ data, currentUser }: Props) {
  const reportId = data.id;
  const [isShared, setIsShared] = useState(data.isShared ?? true);
  
  // States
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      
      const [allComments, allTasks, allActivities, allUsers] = await Promise.all([
        fetchComments(reportId),
        fetchTasks(reportId),
        fetchActivityTimeline(reportId),
        fetchUsers(),
      ]);

      // Filter out comments that are bound to specific inline findings
      const general = allComments.filter((c: any) => !c.findingId);
      setComments(general);
      setTasks(allTasks);
      setActivities(allActivities);
      setUsers(allUsers);
    } catch (err: any) {
      toast.error(`Failed to load collaboration data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setIsShared(data.isShared ?? true);
  }, [reportId, data]);

  const handleToggleShare = async () => {
    try {
      const updatedShare = !isShared;
      await toggleReportShare(reportId, updatedShare);
      setIsShared(updatedShare);
      toast.success(updatedShare ? "Report shared with team" : "Report restricted to private access");
      // Reload timeline
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Share toggle failed: ${err.message}`);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    try {
      const newComment = await createComment(reportId, currentUser.id, text);
      setComments((c) => [...c, newComment]);
      setText("");
      toast.success("Comment posted");
      
      // Reload timeline
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Comment failed: ${err.message}`);
    }
  };

  const handlePostReply = async (parentId: string, replyText: string) => {
    if (!replyText.trim() || !currentUser) return;

    try {
      const newReply = await createComment(reportId, currentUser.id, replyText, undefined, undefined, undefined, parentId);
      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          return c;
        })
      );
      toast.success("Reply posted");
      
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Reply failed: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId: string, parentId?: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(reportId, commentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: c.replies.filter((r: any) => r.id !== commentId) };
            }
            return c;
          })
        );
      } else {
        setComments((c) => c.filter((x) => x.id !== commentId));
      }
      toast.success("Comment deleted");
      
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !currentUser) return;

    try {
      const newTask = await createTask(
        reportId,
        currentUser.id,
        taskTitle,
        "General collaboration task",
        taskAssignee || undefined,
      );
      setTasks((t) => [newTask, ...t]);
      setTaskTitle("");
      setTaskAssignee("");
      setShowAddTask(false);
      toast.success("Task created and assigned");
      
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Task failed: ${err.message}`);
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    if (!currentUser) return;
    const newStatus = task.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    try {
      const updated = await updateTask(reportId, task.id, currentUser.id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: updated.status } : t)));
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
      
      const allActivities = await fetchActivityTimeline(reportId);
      setActivities(allActivities);
    } catch (err: any) {
      toast.error(`Failed to update task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(reportId, taskId);
      setTasks((t) => t.filter((x) => x.id !== taskId));
      toast.success("Task deleted");
    } catch (err: any) {
      toast.error(`Failed to delete task: ${err.message}`);
    }
  };

  const formatActivityLog = (act: any) => {
    const actor = act.user?.name || "Someone";
    const details = act.details || {};
    
    switch (act.type) {
      case "COMMENT_ADDED":
        return {
          text: `${actor} posted a ${details.isReply ? "reply" : "comment"}${details.filePath ? ` on ${details.filePath}` : " on the general thread"}`,
          icon: MessageSquare,
          color: "text-sky-400 bg-sky-500/10",
        };
      case "COMMENT_DELETED":
        return {
          text: `${actor} deleted a comment`,
          icon: Trash2,
          color: "text-rose-400 bg-rose-500/10",
        };
      case "TASK_ASSIGNED":
        return {
          text: `${actor} created task "${details.title}"${details.assigneeName ? ` and assigned it to ${details.assigneeName}` : ""}`,
          icon: ClipboardList,
          color: "text-violet-400 bg-violet-500/10",
        };
      case "TASK_STATUS_CHANGED":
        return {
          text: `${actor} marked task "${details.title}" as ${details.newStatus.toLowerCase()}`,
          icon: ClipboardList,
          color: "text-emerald-400 bg-emerald-500/10",
        };
      case "RESOLUTION_CHANGED":
        return {
          text: `${actor} marked finding ${details.findingId?.split("-")[0] || ""} as ${details.status.toLowerCase()}`,
          icon: Activity,
          color: "text-amber-400 bg-amber-500/10",
        };
      case "REPORT_SHARED":
        return {
          text: `${actor} ${details.isShared ? "shared" : "restricted"} access to this analysis report`,
          icon: Share2,
          color: "text-fuchsia-400 bg-fuchsia-500/10",
        };
      default:
        return {
          text: `${actor} performed an action`,
          icon: Activity,
          color: "text-white/40 bg-white/[0.05]",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Collaboration Banner / Share Settings */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Sharing Toggle Box */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${isShared ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-white/40"}`}>
                {isShared ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div>
                <span className="text-[10px] text-white/35 uppercase tracking-wider block">Access Permissions</span>
                <h4 className="text-[14px] font-semibold text-white/95 mt-0.5">
                  {isShared ? "Shared Team Report" : "Private Analyst Report"}
                </h4>
              </div>
            </div>
            
            <button
              onClick={handleToggleShare}
              className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition ${
                isShared
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10"
                  : "border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              {isShared ? "Make Private" : "Share with Team"}
            </button>
          </div>
          <p className="text-[11.5px] text-white/45 mt-4 leading-relaxed">
            {isShared
              ? "All workspace users can view this codebase scan, add comments, assign remediation tasks, and log resolution metrics."
              : "Access is restricted. Set to Shared to invite other team members to collaborate on resolutions and check list tasks."}
          </p>
        </div>

        {/* Workspace Quick Link Info */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider block">Collaboration Link</span>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-black/40 border border-white/[0.05] p-2">
              <span className="font-mono text-[11px] text-white/40 truncate flex-1 select-all">
                {`http://localhost:5173/analysis/${reportId}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`http://localhost:5173/analysis/${reportId}`);
              toast.success("Workspace link copied");
            }}
            className="w-full text-center mt-4 border border-white/10 rounded-xl py-2 text-[12.5px] text-white/85 transition hover:bg-white/[0.03] flex items-center justify-center gap-1.5"
          >
            <Share2 className="h-4.5 w-4.5" /> Copy Dashboard Link
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Team Discussion Board (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden flex flex-col h-[580px]">
            <header className="border-b border-white/[0.04] px-5 py-4 shrink-0">
              <h3 className="text-sm font-medium text-white/95">Workspace Message Board</h3>
              <p className="mt-1 text-[11px] text-white/40">
                General questions, architectural suggestions, and overall code review remarks.
              </p>
            </header>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onPostReply={handlePostReply}
                  onDeleteComment={handleDeleteComment}
                />
              ))}

              {comments.length === 0 && (
                <div className="py-20 text-center text-[12.5px] text-white/35">
                  💬 No general board messages yet. Add a remark to align the team!
                </div>
              )}
            </div>

            {/* General input footer */}
            <div className="border-t border-white/[0.05] bg-[#0A0A0B]/60 p-4 shrink-0">
              <form onSubmit={handlePostComment} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={currentUser ? "Add a general discussion thread..." : "Select user in header to post comments"}
                  disabled={!currentUser}
                  className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || !currentUser}
                  className="rounded-lg p-1.5 text-sky-400 transition hover:bg-white/[0.05] disabled:opacity-35"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Sprints, Tasks, & Activity Timeline (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Action Tasks checklist */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/95 flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-violet-300" /> Remediations Sprint
              </h3>
              {!showAddTask && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="text-[11.5px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-0.5"
                >
                  <Plus className="h-3.5 w-3.5" /> New Task
                </button>
              )}
            </div>

            {showAddTask && (
              <form onSubmit={handleCreateTask} className="mb-4 bg-white/[0.015] border border-white/[0.05] rounded-xl p-3.5 space-y-3">
                <div>
                  <span className="text-[9.5px] text-white/40 uppercase block mb-1">Task Title</span>
                  <input
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Audit package-lock.json dependency versions"
                    className="w-full rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5 text-[12.5px] text-white outline-none focus:border-violet-400/40"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] text-white/40 uppercase block mb-1">Assignee</span>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-black/40 px-2 py-1.5 text-[12.5px] text-white/95 outline-none focus:border-violet-400/40"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="rounded-lg px-2.5 py-1 text-[11px] text-white/65 hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1 text-[11px] text-[#0A0A0B] hover:brightness-110 font-medium"
                  >
                    Assign
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTaskStatus}
                    onDeleteTask={handleDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-[12px] text-white/35">
                  No active remediations sprint tasks.
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/95 flex items-center gap-1.5 mb-4">
              <Activity className="h-4.5 w-4.5 text-sky-300" /> Workspace Timeline
            </h3>

            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <ActivityRow
                    key={act.id}
                    act={act}
                    formatActivityLog={formatActivityLog}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-[12px] text-white/30">
                  No activities logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
