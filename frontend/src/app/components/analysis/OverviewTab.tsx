import React from "react";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

interface OverviewTabProps {
  data: any; // UnifiedAnalysisResponseDto
}

export function OverviewTab({ data }: OverviewTabProps) {
  const agg = data.aggregator || {};
  const project = data.project || {};
  const security = data.security || {};
  const code = data.review || {};

  const healthScore = agg.projectHealthScore ?? 100;
  const securityScore = agg.securityScore ?? 100;
  const codeQualityScore = agg.codeQualityScore ?? 100;
  const debtScore = agg.technicalDebtScore ?? 0;

  // Curated color based on score value
  const getScoreColor = (score: number, invert = false) => {
    const val = invert ? 100 - score : score;
    if (val >= 80) return "text-emerald-400 from-emerald-500/20 to-emerald-400/5 border-emerald-500/20";
    if (val >= 50) return "text-amber-400 from-amber-500/20 to-amber-400/5 border-amber-500/20";
    return "text-rose-400 from-rose-500/20 to-rose-400/5 border-rose-500/20";
  };

  const healthColorClasses = getScoreColor(healthScore);
  const securityColorClasses = getScoreColor(securityScore);
  const codeQualityColorClasses = getScoreColor(codeQualityScore);
  const debtColorClasses = getScoreColor(debtScore, true);

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] text-white/40 uppercase">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          Executive Summary
        </div>
        <h2 className="mt-2 text-xl font-medium text-white/90 leading-relaxed max-w-4xl" style={{ fontFamily: "Inter, sans-serif" }}>
          {agg.executiveSummary || "No executive summary available for this codebase."}
        </h2>
        <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-white/45">
          <span className="rounded-md bg-white/[0.04] px-2.5 py-1">
            Maturity: <span className="text-white/85 font-medium">{code.projectMaturity || "Unknown"}</span>
          </span>
          <span className="rounded-md bg-white/[0.04] px-2.5 py-1">
            Refactor Effort: <span className="text-white/85 font-medium">{code.estimatedRefactorEffort || "Unknown"}</span>
          </span>
          <span className="rounded-md bg-white/[0.04] px-2.5 py-1">
            Manager: <span className="text-white/85 font-medium">{project.packageManager || "N/A"}</span>
          </span>
        </div>
      </div>

      {/* Grid Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Project Health Score */}
        <div className={`rounded-2xl border bg-gradient-to-b p-5 transition ${healthColorClasses}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-wider text-white/40 uppercase">Project Health</span>
            <Activity className="h-4 w-4 opacity-75" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">{healthScore}</span>
            <span className="text-[13px] text-white/40">/100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="mt-3 text-[11.5px] text-white/50 leading-normal">
            Weighted index of security issues, architecture rules, and codebase technical debt.
          </p>
        </div>

        {/* Security posture Score */}
        <div className={`rounded-2xl border bg-gradient-to-b p-5 transition ${securityColorClasses}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-wider text-white/40 uppercase">Security Score</span>
            <ShieldCheck className="h-4 w-4 opacity-75" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">{securityScore}</span>
            <span className="text-[13px] text-white/40">/100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${securityScore}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
            <span>Risk level: <span className="text-white font-medium">{security.overallRiskLevel || "Low"}</span></span>
            <span className="tabular-nums text-rose-300">{(security.criticalCount || 0) + (security.highCount || 0)} high risks</span>
          </div>
        </div>

        {/* Code Quality Score */}
        <div className={`rounded-2xl border bg-gradient-to-b p-5 transition ${codeQualityColorClasses}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-wider text-white/40 uppercase">Code Quality</span>
            <CheckCircle2 className="h-4 w-4 opacity-75" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">{codeQualityScore}</span>
            <span className="text-[13px] text-white/40">/100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${codeQualityScore}%` }}
            />
          </div>
          <p className="mt-3 text-[11.5px] text-white/50 leading-normal">
            Assesses code readability, modular layout, file sizes, and framework best practices.
          </p>
        </div>

        {/* Technical Debt Score */}
        <div className={`rounded-2xl border bg-gradient-to-b p-5 transition ${debtColorClasses}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-wider text-white/40 uppercase">Technical Debt</span>
            <Wrench className="h-4 w-4 opacity-75" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">{debtScore}</span>
            <span className="text-[13px] text-white/40">/100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${debtScore}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
            <span>Refactor effort: <span className="text-white font-medium">{code.estimatedRefactorEffort || "Low"}</span></span>
            <span className="flex items-center gap-1 text-emerald-300">
              <TrendingDown className="h-3 w-3" /> refactor needed
            </span>
          </div>
        </div>
      </div>

      {/* Main Panels Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Top Issues & Recommended Actions */}
        <div className="space-y-6 lg:col-span-8">
          {/* Top Issues Table */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <header className="border-b border-white/[0.04] px-5 py-4">
              <h3 className="text-sm font-medium text-white/90">Critical & High Priority Issues</h3>
              <p className="mt-1 text-[11px] text-white/40">
                Actionable vectors identified in security, runtime bug, and codebase architecture reviews.
              </p>
            </header>
            <div className="divide-y divide-white/[0.04] max-h-[300px] overflow-y-auto [scrollbar-width:thin]">
              {agg.topIssues && agg.topIssues.length > 0 ? (
                agg.topIssues.map((issue: string, idx: number) => {
                  let type = "Info";
                  let content = issue;
                  let color = "bg-white/[0.06] text-white/60";

                  if (issue.startsWith("[Security]")) {
                    type = "Security";
                    content = issue.replace("[Security] ", "");
                    color = "bg-rose-500/10 text-rose-300 border-rose-500/10";
                  } else if (issue.startsWith("[OWASP]")) {
                    type = "OWASP";
                    content = issue.replace("[OWASP] ", "");
                    color = "bg-rose-500/10 text-rose-300 border-rose-500/10";
                  } else if (issue.startsWith("[Bug]")) {
                    type = "Runtime Bug";
                    content = issue.replace("[Bug] ", "");
                    color = "bg-amber-500/10 text-amber-300 border-amber-500/10";
                  } else if (issue.startsWith("[Architecture]")) {
                    type = "Architecture";
                    content = issue.replace("[Architecture] ", "");
                    color = "bg-sky-500/10 text-sky-300 border-sky-500/10";
                  }

                  return (
                    <div key={idx} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.01] transition">
                      <span className={`rounded-md border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider ${color}`}>
                        {type}
                      </span>
                      <div className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-white/85">
                        {content}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[12.5px] text-white/40">
                  🎉 No critical or high-severity vulnerabilities or bugs detected.
                </div>
              )}
            </div>
          </div>

          {/* Recommended Actions Panel */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
            <h3 className="text-sm font-medium text-white/90">Recommended Actions</h3>
            <p className="mt-1 text-[11px] text-white/40">
              Quick wins and suggestions computed to boost code quality and resolve structural leaks.
            </p>
            <div className="mt-4 space-y-2">
              {agg.recommendedActions && agg.recommendedActions.length > 0 ? (
                agg.recommendedActions.map((act: string, idx: number) => (
                  <div key={idx} className="flex gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] p-3 text-[12.5px] text-white/85">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.04] text-[10.5px] font-semibold text-white/50">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[12px] text-white/35">
                  No actions recommended.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Roadmap Timeline */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 h-full">
            <h3 className="text-sm font-medium text-white/90">Roadmap Timeline</h3>
            <p className="mt-1 text-[11px] text-white/40">
              Prioritized refactoring pipeline recommended by the AI.
            </p>

            <div className="relative mt-6 pl-4 border-l border-white/[0.06] space-y-6">
              {agg.roadmap && agg.roadmap.length > 0 ? (
                agg.roadmap.map((task: any, idx: number) => {
                  let badgeColor = "bg-white/[0.04] text-white/60";
                  let taskLabel = task.task || "";
                  
                  if (taskLabel.startsWith("[Security]")) {
                    badgeColor = "bg-rose-500/20 text-rose-300";
                    taskLabel = taskLabel.replace("[Security] ", "");
                  } else if (taskLabel.startsWith("[Bug Fix]")) {
                    badgeColor = "bg-amber-500/20 text-amber-200";
                    taskLabel = taskLabel.replace("[Bug Fix] ", "");
                  } else if (taskLabel.startsWith("[Quality Quick Win]")) {
                    badgeColor = "bg-emerald-500/20 text-emerald-200";
                    taskLabel = taskLabel.replace("[Quality Quick Win] ", "");
                  } else if (taskLabel.startsWith("[Refactor]")) {
                    badgeColor = "bg-sky-500/20 text-sky-200";
                    taskLabel = taskLabel.replace("[Refactor] ", "");
                  }

                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-violet-400 border border-[#0A0A0B]" />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-semibold tracking-wider text-violet-300 uppercase">
                            Priority {task.priority || (idx + 1)}
                          </span>
                          <span className={`rounded px-1.5 py-0.2 text-[8px] uppercase tracking-wider font-semibold ${badgeColor}`}>
                            {task.task?.match(/^\[(.*?)\]/)?.[1] || "Task"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">
                          {taskLabel}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12px] text-white/35">
                  No roadmap tasks proposed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
