import React, { useState, useEffect } from "react";
import {
  Code,
  Sliders,
  Sparkles,
  Zap,
  Hammer,
  Clock,
  Layout,
  BookOpen,
  Scale,
  Award,
  MessageSquare,
  ClipboardList,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { fetchResolutions, setResolution, fetchTasks } from "../../services/chatService";
import { InlineCommentsPanel } from "./InlineCommentsPanel";

interface CodeReviewTabProps {
  data: any; // UnifiedAnalysisResponseDto
  currentUser: any;
}

export function CodeReviewTab({ data, currentUser }: CodeReviewTabProps) {
  const review = data.review || {};

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
  
  const scores = [
    { label: "Overall Quality", value: review.overallCodeQualityScore ?? 100, icon: Award, color: "from-violet-400 to-fuchsia-400" },
    { label: "Maintainability", value: review.maintainabilityScore ?? 100, icon: Sliders, color: "from-emerald-400 to-teal-400" },
    { label: "Readability", value: review.readabilityScore ?? 100, icon: BookOpen, color: "from-sky-400 to-cyan-400" },
    { label: "Architecture", value: review.architectureScore ?? 100, icon: Layout, color: "from-indigo-400 to-blue-400" },
    { label: "Scalability", value: review.scalabilityScore ?? 100, icon: Scale, color: "from-amber-400 to-orange-400" },
  ];

  // Group all static analysis quality issues
  const qualityIssues = [
    ...(review.architectureIssues || []).map((i: any) => ({ ...i, category: "Architecture" })),
    ...(review.maintainabilityIssues || []).map((i: any) => ({ ...i, category: "Maintainability" })),
    ...(review.readabilityIssues || []).map((i: any) => ({ ...i, category: "Readability" })),
    ...(review.scalabilityConcerns || []).map((i: any) => ({ ...i, category: "Scalability" })),
    ...(review.bestPracticeViolations || []).map((i: any) => ({ ...i, category: "Best Practice" })),
    ...(review.refactoringSuggestions || []).map((i: any) => ({ ...i, category: "Refactoring" })),
  ];

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "text-rose-400 bg-rose-500/10 border-rose-500/10";
      case "high":
        return "text-rose-400 bg-rose-500/10 border-rose-500/10";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/10";
      default:
        return "text-sky-300 bg-sky-500/10 border-sky-500/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Code Review Scores Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map((sc, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/45">
              <span className="text-[11.5px] font-medium truncate">{sc.label}</span>
              <sc.icon className="h-4 w-4 opacity-80" />
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className={`bg-gradient-to-r ${sc.color} bg-clip-text text-3xl font-semibold tracking-tight text-transparent tabular-nums`}>
                {sc.value}
              </span>
              <span className="text-[11px] text-white/35">/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Code Maturity & Summary Banner */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-5">
        <h3 className="text-xs font-semibold text-white/40 tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Quality & Maturity Overview
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/75">
          {review.summary || "No detailed review summary provided."}
        </p>
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Code Review Issues (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <header className="border-b border-white/[0.04] px-5 py-4">
              <h3 className="text-sm font-medium text-white/95">Quality & Architecture Concerns</h3>
              <p className="mt-1 text-[11px] text-white/40">
                Detailed design violations, code smells, coupling issues, and scalability concerns.
              </p>
            </header>
            
            <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto [scrollbar-width:thin]">
              {qualityIssues.length > 0 ? (
                qualityIssues.map((issue: any, idx: number) => {
                  const fid = `${issue.file}-${issue.line || 0}-${issue.category || ""}-${issue.severity || ""}`;
                  const res = resolutions.find((r) => r.findingId === fid);
                  const matchedTasks = tasks.filter((t) => t.findingId === fid);
                  const statusText = res ? res.status : "OPEN";
                  const assigneeText = matchedTasks.length > 0 && matchedTasks[0].assignee ? matchedTasks[0].assignee.name : null;

                  return (
                    <div key={idx} className="p-4 hover:bg-white/[0.01] transition flex items-start gap-3">
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-center ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        {statusText !== "OPEN" && (
                          <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-center ${
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
                          <span className="font-mono text-[12px] font-semibold text-white truncate">{issue.file}</span>
                          {issue.line && (
                            <span className="font-mono text-[10.5px] text-white/35 shrink-0">Line {issue.line}</span>
                          )}
                        </div>
                        <p className="mt-1 text-[12.5px] text-white/80 leading-relaxed">{issue.description}</p>
                        {issue.recommendation && (
                          <div className="mt-2 text-[12px] text-violet-300 leading-normal flex items-start gap-1">
                            <span className="text-white/45">Fix:</span>
                            <span>{issue.recommendation}</span>
                          </div>
                        )}
                        
                        <div className="mt-3.5 flex flex-wrap justify-between items-center gap-3 border-t border-white/[0.03] pt-2.5 text-[10.5px] text-white/45 w-full">
                          <div className="flex flex-wrap items-center gap-4">
                            <span>Category: <span className="text-white/60 font-medium">{issue.category}</span></span>
                            {assigneeText && (
                              <span>• Assigned: <span className="text-violet-300 font-medium">{assigneeText}</span></span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3.5">
                            <select
                              value={statusText}
                              onChange={(e) => handleStatusChange(fid, e.target.value)}
                              className="bg-transparent border-0 rounded-lg text-white/60 hover:text-white outline-none cursor-pointer pr-1 text-[10.5px]"
                            >
                              <option value="OPEN" className="bg-[#0C0C0E] text-white/70">Open</option>
                              <option value="IN_PROGRESS" className="bg-[#0C0C0E] text-amber-300">In Progress</option>
                              <option value="RESOLVED" className="bg-[#0C0C0E] text-emerald-300">Resolved</option>
                              <option value="IGNORED" className="bg-[#0C0C0E] text-white/40">Ignored</option>
                              <option value="FALSE_POSITIVE" className="bg-[#0C0C0E] text-white/40">False Positive</option>
                            </select>

                            <button
                              onClick={() => setSelectedFinding({ issue, fid })}
                              className="text-sky-300 hover:text-sky-200 transition font-medium flex items-center gap-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> 
                              {matchedTasks.length > 0 ? `Tasks (${matchedTasks.length})` : "Discuss"}
                            </button>

                            {data.workspacePath && (
                              <a
                                href={`vscode://file/${data.workspacePath.replace(/\\/g, "/")}/${issue.file}:${issue.line || 1}`}
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
                  🎉 No architectural or code quality issues found in static profiling.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Refactoring Roadmap & Wins (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Quick Wins Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/90 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-300" /> Code Review Quick Wins
            </h3>
            <ul className="mt-3.5 space-y-2">
              {review.quickWins?.map((win: string, i: number) => (
                <li key={i} className="flex gap-2 text-[12px] text-white/70 leading-relaxed pl-3 border-l border-white/5">
                  <span>{win}</span>
                </li>
              )) || <li className="text-[12px] text-white/40">No quick wins suggested.</li>}
            </ul>
          </div>

          {/* High Impact Improvements */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/90 flex items-center gap-1.5">
              <Hammer className="h-4 w-4 text-violet-300" /> High Impact Improvements
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              {review.highImpactImprovements?.map((win: string, i: number) => (
                <li key={i} className="flex gap-2 text-[12px] text-white/75 leading-relaxed pl-3 border-l border-white/5">
                  <span>{win}</span>
                </li>
              )) || <li className="text-[12px] text-white/40">No high impact suggestions.</li>}
            </ul>
          </div>

          {/* Recommended Refactoring Order */}
          {review.recommendedRefactorOrder && review.recommendedRefactorOrder.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <h3 className="text-sm font-medium text-white/90 flex items-center gap-1.5 mb-3">
                <Clock className="h-4 w-4 text-sky-300" /> Recommended Refactoring Order
              </h3>
              <div className="space-y-2">
                {review.recommendedRefactorOrder.map((step: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-white/70 bg-white/[0.01] rounded-lg p-2 border border-white/[0.03]">
                    <span className="grid h-5 w-5 place-items-center rounded bg-white/[0.04] text-[10px] font-semibold text-white/50">{i + 1}</span>
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        filePath={selectedFinding?.issue?.file}
        lineNumber={selectedFinding?.issue?.line}
        currentUser={currentUser}
        findingTitle={selectedFinding?.issue?.description || "Quality Finding Discussion"}
      />
    </div>
  );
}
