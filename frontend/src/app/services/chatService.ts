export interface ChatResponse {
  response: string;
  model?: string;
  createdAt?: string;
  totalDuration?: number;
  evalCount?: number;
}

export interface MessageBlock {
  type: "text" | "code";
  language?: string;
  filename?: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  blocks: MessageBlock[];
  time?: string;
  tokens?: number;
  fallbackUsed?: boolean;
  fallbackProvider?: string;
  providerUnavailable?: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000/api/v1";

/**
 * Custom authenticated fetch wrapper that attaches the JWT token
 * stored in sessionStorage and dispatches a 401 logout/redirect event on expiry.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem("nebula_access_token");
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    sessionStorage.removeItem("nebula_access_token");
    window.dispatchEvent(new CustomEvent("nebula-auth-unauthorized"));
    throw new Error("Session expired. Automatically re-authenticating...");
  }

  return res;
}

/**
 * Logs in a simulated user on the backend to obtain a valid JWT token.
 */
export async function loginSimulatedUser(username: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password: "nebula-dev-pass" }),
  });

  if (!response.ok) {
    throw new Error(`Login failed for simulated user ${username}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.accessToken) {
    sessionStorage.setItem("nebula_access_token", data.accessToken);
  }
  return data;
}


/**
 * Sends a message to the backend AI chat endpoint (fallback/direct)
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await authFetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    let errMsg = `Server returned status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message)
          ? errJson.message.join(", ")
          : errJson.message;
      }
    } catch (_) {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Fetch all conversations from backend
 */
export async function fetchConversations(): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/chat/conversations`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create a new conversation on the backend
 */
export async function createConversation(title?: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/chat/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch detailed messages for a specific conversation
 */
export async function fetchConversationDetails(id: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/chat/conversations/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation details: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Send a message to a specific conversation, and get the assistant response
 */
export async function sendConversationMessage(conversationId: string, message: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    let errMsg = `Failed to send message: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message)
          ? errJson.message.join(", ")
          : errJson.message;
      }
    } catch (_) {
      // ignore
    }
    throw new Error(errMsg);
  }
  return response.json();
}


/**
 * Format timestamp into human friendly text
 */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

/**
 * Maps a backend Message object into a frontend ChatMessage block
 */
export function mapBackendMessageToFrontend(msg: any): ChatMessage {
  return {
    id: msg.id,
    role: msg.role.toLowerCase() === "user" ? "user" : "ai",
    time: msg.createdAt ? formatTime(msg.createdAt) : "now",
    tokens: msg.metadata?.evalCount || undefined,
    fallbackUsed: msg.metadata?.fallbackUsed,
    fallbackProvider: msg.metadata?.fallbackProvider,
    providerUnavailable: msg.metadata?.providerUnavailable,
    blocks: parseMarkdownToBlocks(msg.content),
  };
}

/**
 * Parses markdown text into separate text and code blocks
 * for the Message component.
 */
export function parseMarkdownToBlocks(text: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const regex = /```([^\n]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      blocks.push({ type: "text", content: textBefore });
    }

    const langLine = match[1].trim();
    const content = match[2];

    let language = "text";
    let filename: string | undefined;

    if (langLine) {
      const parts = langLine.split(/\s+/);
      const firstPart = parts[0];
      if (firstPart.includes(":")) {
        const [lang, file] = firstPart.split(":");
        language = lang;
        filename = file;
      } else {
        language = firstPart;
      }

      const filePart = parts.find((p) => p.startsWith("filename="));
      if (filePart) {
        filename = filePart.split("=")[1]?.replace(/['"]/g, "");
      }
    }

    blocks.push({
      type: "code",
      language: language || "text",
      filename,
      content: content.replace(/^\n+|\n+$/g, ""),
    });

    lastIndex = regex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter.trim() || blocks.length === 0) {
    blocks.push({ type: "text", content: textAfter });
  }

  return blocks;
}

/**
 * Upload a file to the backend knowledge ingestion pipeline
 */
export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errMsg = `Upload failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message)
          ? errJson.message.join(", ")
          : errJson.message;
      }
    } catch (_) {
      // ignore
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Fetch all knowledge files from the backend
 */
export async function fetchKnowledgeFiles(): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/knowledge/files`);
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge files: ${response.statusText}`);
  }
  return response.json();
}

// Client-side cache storage
interface CacheStore {
  analysisHistory: any[] | null;
  users: any[] | null;
  comments: Record<string, any[]>;
  tasks: Record<string, any[]>;
  activities: Record<string, any[]>;
}

const clientCache: CacheStore = {
  analysisHistory: null,
  users: null,
  comments: {},
  tasks: {},
  activities: {},
};

export function clearAnalysisHistoryCache() {
  clientCache.analysisHistory = null;
}

export function clearUsersCache() {
  clientCache.users = null;
}

export function clearCollaborationCache(reportId: string) {
  delete clientCache.comments[reportId];
  delete clientCache.tasks[reportId];
  delete clientCache.activities[reportId];
}

/**
 * Fetch past analysis reports history from cache
 */
export async function fetchAnalysisHistory(): Promise<any[]> {
  if (clientCache.analysisHistory) {
    return clientCache.analysisHistory;
  }
  const response = await authFetch(`${API_BASE_URL}/analysis/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis history: ${response.statusText}`);
  }
  const data = await response.json();
  clientCache.analysisHistory = data;
  return data;
}

/**
 * Fetch full cached analysis report detail payload by ID
 */
export async function fetchUnifiedAnalysis(id: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/analysis/unified/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis details: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Upload a project ZIP archive and trigger single-pass unified analysis
 */
export async function uploadUnifiedAnalysis(file: File): Promise<any> {
  clearAnalysisHistoryCache();
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(`${API_BASE_URL}/analysis/unified`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errMsg = `Analysis failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message)
          ? errJson.message.join(", ")
          : errJson.message;
      }
    } catch (_) {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Delete a cached analysis report from the backend
 */
export async function deleteAnalysis(id: string): Promise<any> {
  clearAnalysisHistoryCache();
  clearCollaborationCache(id);
  const response = await authFetch(`${API_BASE_URL}/analysis/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete analysis: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Run unified analysis directly on a local workspace path
 */
export async function runWorkspaceAnalysis(path: string): Promise<any> {
  clearAnalysisHistoryCache();
  const response = await authFetch(`${API_BASE_URL}/analysis/workspace`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    let errMsg = `Workspace analysis failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message)
          ? errJson.message.join(", ")
          : errJson.message;
      }
    } catch (_) {
      // ignore
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Fetch all registered team users
 */
export async function fetchUsers(): Promise<any[]> {
  if (clientCache.users) {
    return clientCache.users;
  }
  const response = await authFetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  const data = await response.json();
  clientCache.users = data;
  return data;
}


/**
 * Toggle the sharing status of a report
 */
export async function toggleReportShare(reportId: string, isShared: boolean): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/share`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isShared }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update sharing: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch comments for a report
 */
export async function fetchComments(reportId: string): Promise<any[]> {
  if (clientCache.comments[reportId]) {
    return clientCache.comments[reportId];
  }
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/comments`);
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }
  const data = await response.json();
  clientCache.comments[reportId] = data;
  return data;
}

/**
 * Post a new comment or reply
 */
export async function createComment(
  reportId: string,
  userId: string,
  content: string,
  filePath?: string,
  lineNumber?: number,
  findingId?: string,
  parentId?: string,
): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, content, filePath, lineNumber, findingId, parentId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to post comment: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a comment
 */
export async function deleteComment(reportId: string, commentId: string): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete comment: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all task assignments for a report
 */
export async function fetchTasks(reportId: string): Promise<any[]> {
  if (clientCache.tasks[reportId]) {
    return clientCache.tasks[reportId];
  }
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/tasks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }
  const data = await response.json();
  clientCache.tasks[reportId] = data;
  return data;
}

/**
 * Assign a task
 */
export async function createTask(
  reportId: string,
  creatorId: string,
  title: string,
  description?: string,
  assigneeId?: string,
  filePath?: string,
  findingId?: string,
): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creatorId, title, description, assigneeId, filePath, findingId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update a task's status or assignee
 */
export async function updateTask(
  reportId: string,
  taskId: string,
  userId: string,
  status?: string,
  assigneeId?: string,
): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, status, assigneeId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a task
 */
export async function deleteTask(reportId: string, taskId: string): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch finding statuses/resolutions
 */
export async function fetchResolutions(reportId: string): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/resolutions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch resolutions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Set resolution status on a specific code finding
 */
export async function setResolution(
  reportId: string,
  findingId: string,
  status: string,
  notes: string | null,
  userId: string,
): Promise<any> {
  clearCollaborationCache(reportId);
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/resolutions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ findingId, status, notes, userId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update resolution: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch activity timeline logs for a report
 */
export async function fetchActivityTimeline(reportId: string): Promise<any[]> {
  if (clientCache.activities[reportId]) {
    return clientCache.activities[reportId];
  }
  const response = await authFetch(`${API_BASE_URL}/analysis/${reportId}/activity`);
  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }
  const data = await response.json();
  clientCache.activities[reportId] = data;
  return data;
}

/**
 * Fetch all available workspaces for active user
 */
export async function fetchWorkspaces(): Promise<any[]> {
  const response = await authFetch(`${API_BASE_URL}/workspace/list?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Import a local workspace path
 */
export async function importWorkspace(path: string, name?: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, name }),
  });
  if (!response.ok) {
    let errMsg = `Import failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

/**
 * Upload a ZIP archive and create a new workspace
 */
export async function uploadZipWorkspace(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(`${API_BASE_URL}/workspace/upload-zip`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    let errMsg = `ZIP upload failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

/**
 * Fetch workspace details including files tree
 */
export async function fetchWorkspaceDetails(id: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/${id}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workspace: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a workspace and its files
 */
export async function deleteWorkspace(id: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete workspace: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create a new file or folder in a workspace
 */
export async function createFileOrFolder(workspaceId: string, path: string, type: 'file' | 'folder', content = ""): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/files/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, path, type, content }),
  });
  if (!response.ok) {
    let errMsg = `Create failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

/**
 * Rename/Move a file or folder in a workspace
 */
export async function renameFileOrFolder(workspaceId: string, oldPath: string, newPath: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/files/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, oldPath, newPath }),
  });
  if (!response.ok) {
    let errMsg = `Rename failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

/**
 * Delete a file or folder in a workspace
 */
export async function deleteFileOrFolder(workspaceId: string, path: string): Promise<any> {
  const response = await authFetch(`${API_BASE_URL}/workspace/files/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, path }),
  });
  if (!response.ok) {
    let errMsg = `Delete failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return response.json();
}

