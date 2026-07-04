import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertOctagon,
  Key,
  ShieldX,
  FileLock2,
  Wrench,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { fetchResolutions, setResolution, fetchTasks } from "../../services/chatService";
import { InlineCommentsPanel } from "./InlineCommentsPanel";

interface SecurityTabProps {
  data: any; // UnifiedAnalysisResponseDto
  currentUser: any;
}

export function SecurityTab({ data, currentUser }: SecurityTabProps) {
  const security = data.security || {};
  const [selectedRemediation, setSelectedRemediation] = useState<number | null>(null);

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
        return "bg-rose-500/20 text-rose-300 border-rose-500/20";
      case "high":
        return "bg-rose-500/15 text-rose-300 border-rose-500/10";
      case "medium":
        return "bg-amber-500/15 text-amber-300 border-amber-500/10";
      default:
        return "bg-sky-500/15 text-sky-300 border-sky-500/10";
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "critical":
      case "high":
        return "text-rose-400 bg-rose-500/10 border-rose-500/15";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/15";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/15";
    }
  };

  // Compile all security issue items
  const allIssues = [
    ...(security.secretExposure || []).map((i: any) => ({ ...i, category: "Secret Exposure", icon: Key })),
    ...(security.authenticationWeaknesses || []).map((i: any) => ({ ...i, category: "Auth Weakness", icon: Lock })),
    ...(security.authorizationWeaknesses || []).map((i: any) => ({ ...i, category: "Authz Weakness", icon: Lock })),
    ...(security.dependencyVulnerabilities || []).map((i: any) => ({ ...i, category: "Dependency Vulnerability", icon: ShieldX })),
    ...(security.owaspTop10Risks || []).map((i: any) => ({ ...i, category: "OWASP Top 10", icon: AlertOctagon })),
    ...(security.environmentConfigRisks || []).map((i: any) => ({ ...i, category: "Environment/Config", icon: FileLock2 })),
    ...(security.bestPracticeViolations || []).map((i: any) => ({ ...i, category: "Security Practice", icon: ShieldAlert })),
  ];

  return (
    <div className="space-y-6">
      {/* Posture Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${getRiskLevelColor(security.overallRiskLevel)}`}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-current opacity-20">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider block">Overall Risk Level</span>
            <h4 className="text-lg font-semibold text-white/90">{security.overallRiskLevel || "High"}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-white/35 uppercase tracking-wider block">Security Score</span>
            <h4 className="text-lg font-semibold text-white/90 tabular-nums">{security.securityScore ?? 100}/100</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex items-center gap-4 col-span-1 sm:col-span-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/15 text-rose-300">
            <ShieldX className="h-5 w-5" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-white/35 text-[9px] uppercase tracking-wider block">Critical Issues</span>
              <span className="text-[15px] font-semibold text-rose-300 tabular-nums">{security.criticalCount || 0}</span>
            </div>
            <div>
              <span className="text-white/35 text-[9px] uppercase tracking-wider block">High Issues</span>
              <span className="text-[15px] font-semibold text-rose-300 tabular-nums">{security.highCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
        <h3 className="text-[10px] tracking-wider text-white/40 uppercase">Audit Assessment Summary</h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
          {security.summary || "No security assessment summary available."}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Security Issues (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <header className="border-b border-white/[0.04] px-5 py-4">
              <h3 className="text-sm font-medium text-white/95">Audit Findings</h3>
              <p className="mt-1 text-[11px] text-white/40">
                Weak points sorted by threat level. Secure all exposed keys and auth loopholes.
              </p>
            </header>

            <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto [scrollbar-width:thin]">
              {allIssues.length > 0 ? (
                allIssues.map((issue: any, idx: number) => {
                  const Icon = issue.icon || ShieldAlert;
                  const fid = `${issue.file}-${issue.line || 0}-${issue.category || ""}-${issue.severity || ""}`;
                  const res = resolutions.find((r) => r.findingId === fid);
                  const matchedTasks = tasks.filter((t) => t.findingId === fid);
                  const statusText = res ? res.status : "OPEN";
                  const assigneeText = matchedTasks.length > 0 && matchedTasks[0].assignee ? matchedTasks[0].assignee.name : null;

                  return (
                    <div key={idx} className="p-4 hover:bg-white/[0.01] transition flex items-start gap-3">
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-center ${getSeverityBadge(issue.severity)}`}>
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
                          <span className="font-mono text-[12.5px] font-semibold text-white truncate">{issue.file}</span>
                          {issue.line && (
                            <span className="font-mono text-[11px] text-white/35 shrink-0">Line {issue.line}</span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">{issue.description}</p>
                        
                        {issue.snippet && (
                          <pre className="mt-2.5 overflow-x-auto rounded-lg border border-white/[0.05] bg-black/40 p-2.5 font-mono text-[11px] text-white/60 [scrollbar-width:thin]">
                            <code>{issue.snippet}</code>
                          </pre>
                        )}
                        
                        {issue.remediation && (
                          <div className="mt-2 text-[12px] text-violet-300 leading-normal flex items-start gap-1">
                            <span className="text-white/45">Remedy:</span>
                            <span>{issue.remediation}</span>
                          </div>
                        )}

                        <div className="mt-3.5 flex flex-wrap justify-between items-center gap-3 border-t border-white/[0.03] pt-2.5 text-[10.5px] text-white/45 w-full">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Icon className="h-3 w-3 opacity-60" /> {issue.category}
                            </span>
                            {issue.owaspCategory && (
                              <span>• OWASP: <span className="text-white/60 font-medium">{issue.owaspCategory}</span></span>
                            )}
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
                  🛡️ No security issues or vulnerabilities found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Suggested Remediations & Actions (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Immediate Actions */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/95">Immediate Actions Required</h3>
            <p className="mt-1 text-[11px] text-white/40 mb-3">
              Critical mitigations that must be implemented immediately.
            </p>
            <div className="space-y-2">
              {security.immediateActions?.map((act: string, i: number) => (
                <div key={i} className="flex gap-2.5 text-[12px] text-rose-300 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl p-3 leading-relaxed">
                  <span className="font-semibold text-rose-400 shrink-0">•</span>
                  <span>{act}</span>
                </div>
              )) || <div className="text-[12px] text-white/35">No immediate actions.</div>}
            </div>
          </div>

          {/* Code remediations */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/95 flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-violet-300" /> Remediations Diff ({security.suggestedRemediations?.length || 0})
            </h3>
            <p className="mt-1 text-[11px] text-white/40 mb-4">
              Inspect suggested code improvements for vulnerability areas.
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {security.suggestedRemediations && security.suggestedRemediations.length > 0 ? (
                security.suggestedRemediations.map((rem: any, idx: number) => {
                  const isOpen = selectedRemediation === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                      <button
                        onClick={() => setSelectedRemediation(isOpen ? null : idx)}
                        className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-[12.5px] hover:bg-white/[0.02]"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-medium text-white truncate block">{rem.file}</span>
                          <span className="text-[11px] text-white/40 block mt-0.5 truncate">{rem.explanation}</span>
                        </div>
                        <span className="text-violet-300 text-[11.5px] shrink-0 flex items-center gap-1">
                          {isOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {isOpen ? "Hide" : "Inspect"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 border-t border-white/[0.04] space-y-3 bg-black/20">
                          <div>
                            <span className="text-[9.5px] font-semibold text-rose-300 uppercase block mb-1">Vulnerable Code</span>
                            <pre className="overflow-x-auto rounded-lg border border-rose-500/10 bg-rose-950/10 p-2 font-mono text-[10.5px] text-rose-200/70 [scrollbar-width:thin]">
                              <code>{rem.originalSnippet || "// No snippet provided"}</code>
                            </pre>
                          </div>
                          <div>
                            <span className="text-[9.5px] font-semibold text-emerald-300 uppercase block mb-1">Secure Remediated Code</span>
                            <pre className="overflow-x-auto rounded-lg border border-emerald-500/10 bg-emerald-950/10 p-2 font-mono text-[10.5px] text-emerald-200 [scrollbar-width:thin]">
                              <code>{rem.remediedSnippet}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12.5px] text-white/35">
                  No security remediations computed.
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
        filePath={selectedFinding?.issue?.file}
        lineNumber={selectedFinding?.issue?.line}
        currentUser={currentUser}
        findingTitle={selectedFinding?.issue?.description || "Security Finding Discussion"}
      />
    </div>
  );
}
