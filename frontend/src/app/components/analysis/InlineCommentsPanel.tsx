import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Users, CheckSquare, MessageSquare, ClipboardList, Plus, UserPlus, Check } from "lucide-react";
import { CollaborationSkeleton } from "../Skeleton";
import { toast } from "sonner";
import {
  fetchComments,
  createComment,
  deleteComment,
  fetchTasks,
  createTask,
  updateTask,
  fetchUsers,
} from "../../services/chatService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  findingId: string;
  filePath?: string;
  lineNumber?: number;
  currentUser: any;
  findingTitle: string;
}

export function InlineCommentsPanel({
  isOpen,
  onClose,
  reportId,
  findingId,
  filePath,
  lineNumber,
  currentUser,
  findingTitle,
}: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Replies state
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const loadData = async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      const allComments = await fetchComments(reportId);
      // Filter comments specifically for this findingId
      const filtered = allComments.filter((c: any) => c.findingId === findingId);
      setComments(filtered);

      const allTasks = await fetchTasks(reportId);
      const filteredTasks = allTasks.filter((t: any) => t.findingId === findingId);
      setTasks(filteredTasks);

      const allUsers = await fetchUsers();
      setUsers(allUsers);
    } catch (err: any) {
      toast.error(`Failed to load discussion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setReplyToId(null);
      setText("");
      setShowAddTask(false);
      setTaskTitle("");
      setTaskAssignee("");
    }
  }, [isOpen, reportId, findingId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    try {
      const newComment = await createComment(
        reportId,
        currentUser.id,
        text,
        filePath,
        lineNumber,
        findingId,
      );
      setComments((c) => [...c, newComment]);
      setText("");
      toast.success("Comment posted");
    } catch (err: any) {
      toast.error(`Comment failed: ${err.message}`);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || !currentUser) return;

    try {
      const newReply = await createComment(
        reportId,
        currentUser.id,
        replyText,
        filePath,
        lineNumber,
        findingId,
        parentId,
      );
      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          return c;
        })
      );
      setReplyText("");
      setReplyToId(null);
      toast.success("Reply posted");
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
        `Task associated with: ${findingTitle}`,
        taskAssignee || undefined,
        filePath,
        findingId,
      );
      setTasks((t) => [newTask, ...t]);
      setTaskTitle("");
      setTaskAssignee("");
      setShowAddTask(false);
      toast.success("Task created and assigned");
    } catch (err: any) {
      toast.error(`Task assignment failed: ${err.message}`);
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    if (!currentUser) return;
    const newStatus = task.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    try {
      const updated = await updateTask(reportId, task.id, currentUser.id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: updated.status } : t)));
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      toast.error(`Failed to update task: ${err.message}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Back scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-lg border-l border-white/[0.08] bg-[#0C0C0E]/95 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4.5">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.25em] text-violet-300 uppercase font-semibold">
                  Discussion & Tasks
                </div>
                <h3 className="text-[14px] font-semibold text-white/95 truncate mt-1">
                  {findingTitle}
                </h3>
                {filePath && (
                  <span className="text-[10.5px] font-mono text-white/35 mt-0.5 block truncate">
                    {filePath} {lineNumber ? `· Line ${lineNumber}` : ""}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [scrollbar-width:thin]">
              {/* Tasks Checklist Sub-section */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] uppercase tracking-wider text-white/45 font-semibold flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5 text-violet-400" /> Resolution Tasks ({tasks.length})
                  </h4>
                  {!showAddTask && (
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Create Task
                    </button>
                  )}
                </div>

                {showAddTask && (
                  <form onSubmit={handleCreateTask} className="mb-4 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 space-y-3">
                    <div>
                      <span className="text-[9.5px] text-white/40 uppercase block mb-1">Task Title</span>
                      <input
                        required
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g. Refactor postcode input regex check..."
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
                            {u.name} ({u.title})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="rounded-lg px-2.5 py-1 text-[11.5px] text-white/60 hover:bg-white/[0.04]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-gradient-to-r from-violet-500 to-sky-400 px-3 py-1 text-[11.5px] text-[#0A0A0B] hover:brightness-110"
                      >
                        Assign Task
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const isResolved = task.status === "RESOLVED";
                      return (
                        <div key={task.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white/[0.015] hover:bg-white/[0.03] border border-white/[0.03]">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              onClick={() => handleToggleTaskStatus(task)}
                              className={`mt-0.5 grid h-4.5 w-4.5 place-items-center rounded border transition shrink-0 ${
                                isResolved
                                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                                  : "border-white/20 hover:border-violet-400/40"
                              }`}
                            >
                              {isResolved && <Check className="h-3 w-3" />}
                            </button>
                            <div className="min-w-0">
                              <span className={`text-[12.5px] block font-medium ${isResolved ? "line-through text-white/40" : "text-white/90"}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] text-white/35 mt-0.5 block">
                                {task.assignee ? `Assigned to: ${task.assignee.name}` : "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-2 text-[11.5px] text-white/30">
                      No tasks assigned yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Discussion Section */}
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-wider text-white/45 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-400" /> Discussion Thread ({comments.length})
                </h4>

                {loading && comments.length === 0 ? (
                  <CollaborationSkeleton />
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        {/* Parent Comment */}
                        <div className="group relative rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${comment.user?.avatar || "from-violet-500 to-sky-400"} text-[10px] text-[#0A0A0B] font-semibold`}>
                                {comment.user?.name?.split(" ").map((n: string) => n[0]).join("") || comment.user?.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-[12.5px] font-medium text-white/95">{comment.user?.name}</span>
                                <span className="text-[9.5px] text-white/35 block mt-0.5">{comment.user?.title}</span>
                              </div>
                            </div>
                            <span className="text-[10.5px] text-white/30 shrink-0">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/80 pl-9.5">
                            {comment.content}
                          </p>

                          <div className="mt-2 pl-9.5 flex items-center gap-3 text-[11px]">
                            <button
                              onClick={() => {
                                setReplyToId(replyToId === comment.id ? null : comment.id);
                                setReplyText("");
                              }}
                              className="text-sky-400 hover:text-sky-300 font-medium"
                            >
                              Reply
                            </button>
                            {currentUser && comment.userId === currentUser.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-rose-400/80 hover:text-rose-300 font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.map((reply: any) => (
                          <div key={reply.id} className="ml-8 group relative rounded-xl border border-white/[0.03] bg-white/[0.005] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${reply.user?.avatar || "from-violet-500 to-sky-400"} text-[8px] text-[#0A0A0B] font-semibold`}>
                                  {reply.user?.name?.split(" ").map((n: string) => n[0]).join("") || reply.user?.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-[12px] font-medium text-white/95">{reply.user?.name}</span>
                                  <span className="text-[9px] text-white/35 block mt-0.5">{reply.user?.title}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-white/30 shrink-0">
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="mt-2 text-[12px] leading-relaxed text-white/75 pl-8">
                              {reply.content}
                            </p>

                            {currentUser && reply.userId === currentUser.id && (
                              <div className="mt-1 pl-8">
                                <button
                                  onClick={() => handleDeleteComment(reply.id, comment.id)}
                                  className="text-rose-400/80 hover:text-rose-300 text-[11px] font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Reply Input Box */}
                        {replyToId === comment.id && (
                          <div className="ml-8 flex items-center gap-2 p-1.5 rounded-lg border border-white/[0.05] bg-white/[0.01]">
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${comment.user?.name || "thread"}...`}
                              className="flex-1 bg-transparent px-2.5 py-1 text-[12px] text-white outline-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && replyText.trim()) {
                                  handlePostReply(comment.id);
                                }
                              }}
                            />
                            <button
                              disabled={!replyText.trim()}
                              onClick={() => handlePostReply(comment.id)}
                              className="rounded-lg p-1.5 text-sky-400 transition hover:bg-white/[0.05] disabled:opacity-30"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-6 text-[12px] text-white/35">
                        💬 No comments yet. Start the conversation!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Main Comment Box Input */}
            <div className="border-t border-white/[0.06] bg-[#0A0A0B]/60 p-4.5">
              <form onSubmit={handlePostComment} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={currentUser ? "Write a comment..." : "Select user in header to comment"}
                  disabled={!currentUser}
                  className="flex-1 bg-transparent text-[13px] text-white/95 outline-none placeholder:text-white/30"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
