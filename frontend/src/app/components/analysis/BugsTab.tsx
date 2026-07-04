import React, { useState, useEffect } from "react";
import {
  Bug,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Wrench,
  Flame,
  HelpCircle,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { fetchResolutions, setResolution, fetchTasks } from "../../services/chatService";
import { InlineCommentsPanel } from "./InlineCommentsPanel";

interface BugsTabProps {
  data: any; // UnifiedAnalysisResponseDto
  currentUser: any;
}

export function BugsTab({ data, currentUser }: BugsTabProps) {
  const bugs = data.bugs || {};
  const [selectedFix, setSelectedFix] = useState<number | null>(null);

  // Collaboration State
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);

  const loadCollabData = async () => {
    try {
      const res = await fetchResolutions(data.id);
      setResolutions(res);
      const tsk = await fetchTasks(data.id);
      setTasks(tsk);
    } catch (_) {}
  };

  useEffect(() => {
    loadCollabData();
  }, [data.id]);

  const handleStatusChange = async (findingId: string, status: string) => {
    if (!currentUser) {
      toast.error("Please select a simulated user in the header first.");
      return;
    }
    try {
      await setResolution(data.id, findingId, status, "Updated status", currentUser.id);
      toast.success("Resolution status updated");
      loadCollabData();
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-rose-500/10 text-rose-300 border-rose-500/10";
      case "high":
        return "bg-rose-500/10 text-rose-300 border-rose-500/10";
      case "medium":
        return "bg-amber-500/10 text-amber-300 border-amber-500/10";
      case "low":
        return "bg-sky-500/10 text-sky-300 border-sky-500/10";
      default:
        return "bg-white/[0.06] text-white/50 border-white/[0.04]";
    }
  };

  // Compile all issues into a unified list
  const allBugs = [
    ...(bugs.criticalBugs || []).map((b: any) => ({ ...b, category: "Critical Bug" })),
    ...(bugs.warnings || []).map((b: any) => ({ ...b, category: "Warning" })),
    ...(bugs.securityIssues || []).map((b: any) => ({ ...b, category: "Security" })),
    ...(bugs.performanceIssues || []).map((b: any) => ({ ...b, category: "Performance" })),
    ...(bugs.dependencyIssues || []).map((b: any) => ({ ...b, category: "Dependency" })),
    ...(bugs.codeSmells || []).map((b: any) => ({ ...b, category: "Code Smell" })),
  ];

  return (
    <div className="space-y-6">
      {/* Risk Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/15 text-rose-300">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Overall Risk Score</span>
            <h4 className="mt-0.5 text-[15px] font-medium text-white">{bugs.overallRiskScore || "Medium"}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Fix Effort Estimate</span>
            <h4 className="mt-0.5 text-[15px] font-medium text-white">{bugs.estimatedFixEffort || "Medium"}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Total Scanned Issues</span>
            <h4 className="mt-0.5 text-[15px] font-medium text-white tabular-nums">{allBugs.length}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Scanned Issues Grid (Left 7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <header className="border-b border-white/[0.04] px-5 py-4">
              <h3 className="text-sm font-medium text-white/95">Scanned Code Issues</h3>
              <p className="mt-1 text-[11px] text-white/40">
                Detailed runtime logs, code smells, performance bottlenecks, and validation warnings.
              </p>
            </header>
            <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto [scrollbar-width:thin]">
              {allBugs.length > 0 ? (
                allBugs.map((bug: any, idx: number) => {
                  const fid = `${bug.file}-${bug.line || 0}-${bug.category || ""}-${bug.severity || ""}`;
                  const res = resolutions.find((r) => r.findingId === fid);
                  const matchedTasks = tasks.filter((t) => t.findingId === fid);
                  const statusText = res ? res.status : "OPEN";
                  const assigneeText = matchedTasks.length > 0 && matchedTasks[0].assignee ? matchedTasks[0].assignee.name : null;

                  return (
                    <div key={idx} className="p-4 hover:bg-white/[0.01] transition flex items-start gap-3">
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className={`rounded-md border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-center ${getSeverityBadge(bug.severity)}`}>
                          {bug.severity}
                        </span>
                        {statusText !== "OPEN" && (
                          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-center ${
                            statusText === "RESOLVED" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/10" :
                            statusText === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-300 border-amber-500/10" :
                            "bg-white/[0.06] text-white/50 border-white/[0.04]"
                          }`}>
                            {statusText.replace("_", " ")}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[12.5px] font-semibold text-white truncate">{bug.file}</span>
                          {bug.line && (
                            <span className="font-mono text-[11px] text-white/35 shrink-0">Line {bug.line}</span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/75">{bug.description}</p>
                        {bug.snippet && (
                          <pre className="mt-2.5 overflow-x-auto rounded-lg border border-white/[0.05] bg-black/40 p-2.5 font-mono text-[11px] text-white/60 leading-normal [scrollbar-width:thin]">
                            <code>{bug.snippet}</code>
                          </pre>
                        )}
                        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.03] pt-2.5 text-[11.5px] text-white/45">
                          <div className="flex flex-wrap items-center gap-4">
                            <span>Category: <span className="text-white/70">{bug.category}</span></span>
                            {assigneeText && (
                              <span>Assigned: <span className="text-violet-300 font-medium">{assigneeText}</span></span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3.5">
                            <select
                              value={statusText}
                              onChange={(e) => handleStatusChange(fid, e.target.value)}
                              className="bg-transparent border-0 rounded-lg text-white/60 hover:text-white outline-none cursor-pointer pr-1 text-[11.5px]"
                            >
                              <option value="OPEN" className="bg-[#0C0C0E] text-white/70">Open</option>
                              <option value="IN_PROGRESS" className="bg-[#0C0C0E] text-amber-300">In Progress</option>
                              <option value="RESOLVED" className="bg-[#0C0C0E] text-emerald-300">Resolved</option>
                              <option value="IGNORED" className="bg-[#0C0C0E] text-white/40">Ignored</option>
                              <option value="FALSE_POSITIVE" className="bg-[#0C0C0E] text-white/40">False Positive</option>
                            </select>

                            <button
                              onClick={() => setSelectedFinding({ bug, fid })}
                              className="text-sky-300 hover:text-sky-200 transition font-medium flex items-center gap-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> 
                              {matchedTasks.length > 0 ? `Tasks (${matchedTasks.length})` : "Discuss"}
                            </button>

                            {data.workspacePath && (
                              <a
                                href={`vscode://file/${data.workspacePath.replace(/\\/g, "/")}/${bug.file}:${bug.line || 1}`}
                                className="text-sky-300 hover:text-sky-200 transition font-medium flex items-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open in VS Code
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-[12.5px] text-white/35">
                  🎉 No bugs or code warnings detected in your project files.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Fixes & Diffs Panel (Right 5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 h-full">
            <h3 className="text-sm font-medium text-white/95">Code Fix Remediation ({bugs.suggestedFixes?.length || 0})</h3>
            <p className="mt-1 text-[11px] text-white/40 mb-4">
              AI-generated diff proposals. Select a file to inspect the recommended refactor solution.
            </p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {bugs.suggestedFixes && bugs.suggestedFixes.length > 0 ? (
                bugs.suggestedFixes.map((fix: any, idx: number) => {
                  const isOpen = selectedFix === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                      <button
                        onClick={() => setSelectedFix(isOpen ? null : idx)}
                        className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-[12.5px] hover:bg-white/[0.02]"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-medium text-white truncate block">{fix.file}</span>
                          <span className="text-[11px] text-white/40 block mt-0.5 truncate">{fix.explanation}</span>
                        </div>
                        <span className="text-violet-300 text-[11.5px] shrink-0 flex items-center gap-1">
                          {isOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {isOpen ? "Hide" : "Inspect"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 border-t border-white/[0.04] space-y-3 bg-black/20">
                          <div>
                            <span className="text-[9.5px] font-semibold text-rose-300 uppercase block mb-1">Original Code</span>
                            <pre className="overflow-x-auto rounded-lg border border-rose-500/10 bg-rose-950/10 p-2 font-mono text-[10.5px] text-rose-200/70 [scrollbar-width:thin]">
                              <code>{fix.originalSnippet || "// No snippet provided"}</code>
                            </pre>
                          </div>
                          <div>
                            <span className="text-[9.5px] font-semibold text-emerald-300 uppercase block mb-1">Suggested Remediation</span>
                            <pre className="overflow-x-auto rounded-lg border border-emerald-500/10 bg-emerald-950/10 p-2 font-mono text-[10.5px] text-emerald-200 [scrollbar-width:thin]">
                              <code>{fix.suggestedSnippet}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12.5px] text-white/35">
                  No automated diffs generated for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Comments Overlay Drawer */}
      <InlineCommentsPanel
        isOpen={!!selectedFinding}
        onClose={() => {
          setSelectedFinding(null);
          loadCollabData();
        }}
        reportId={data.id}
        findingId={selectedFinding?.fid || ""}
        filePath={selectedFinding?.bug?.file}
        lineNumber={selectedFinding?.bug?.line}
        currentUser={currentUser}
        findingTitle={selectedFinding?.bug?.description || "Finding Discussion"}
      />
    </div>
  );
}
