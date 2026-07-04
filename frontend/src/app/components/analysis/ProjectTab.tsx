import React from "react";
import {
  Code2,
  FolderTree,
  ListChecks,
  AlertTriangle,
  Blocks,
  Compass,
  FileCode,
} from "lucide-react";

interface ProjectTabProps {
  data: any; // UnifiedAnalysisResponseDto
}

export function ProjectTab({ data }: ProjectTabProps) {
  const project = data.project || {};
  const complexity = project.complexity || {};
  const bestPractices = project.bestPractices || {};
  const dependencies = project.dependencies || {};

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Tech Stack & Overview */}
      <div className="space-y-6 lg:col-span-8">
        {/* Architecture & Tech Summary */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
          <div className="flex items-center gap-2.5 text-[10px] tracking-wider text-white/40 uppercase">
            <Compass className="h-4 w-4 text-violet-300" />
            Architecture Overview
          </div>
          <h3 className="mt-4 text-[13.5px] font-medium text-white/95">Folder Structure Overview</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/65 whitespace-pre-line">
            {project.folderStructureOverview || "No directory overview available."}
          </p>

          <h3 className="mt-6 text-[13.5px] font-medium text-white/95">Architecture & Tech Stack Summary</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/65">
            {project.architectureSummary || "No architecture summary available."}
          </p>
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/65">
            {project.technologyStackSummary || ""}
          </p>
        </div>

        {/* Best Practices Adherence */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div className="flex items-center gap-2.5 text-[10px] tracking-wider text-white/40 uppercase">
              <ListChecks className="h-4 w-4 text-emerald-300" />
              Best Practices Adherence
            </div>
            {bestPractices.adherenceScore !== undefined && (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/10">
                Score: {bestPractices.adherenceScore}%
              </span>
            )}
          </div>
          
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-[12.5px] font-medium text-emerald-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Key Strengths
              </h4>
              <ul className="mt-2 space-y-2">
                {bestPractices.detectedStrengths?.map((str: string, i: number) => (
                  <li key={i} className="text-[12px] text-white/70 leading-relaxed pl-3 border-l border-white/5">
                    {str}
                  </li>
                )) || <li className="text-[12px] text-white/40">No key strengths highlighted.</li>}
              </ul>
            </div>

            <div>
              <h4 className="text-[12.5px] font-medium text-amber-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Improvement Areas
              </h4>
              <ul className="mt-2 space-y-2">
                {bestPractices.improvementAreas?.map((imp: string, i: number) => (
                  <li key={i} className="text-[12px] text-white/70 leading-relaxed pl-3 border-l border-white/5">
                    {imp}
                  </li>
                )) || <li className="text-[12px] text-white/40">No improvement areas reported.</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Project Recommendations */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
          <div className="flex items-center gap-2.5 text-[10px] tracking-wider text-white/40 uppercase mb-4">
            <Blocks className="h-4 w-4 text-sky-300" />
            General Recommendations
          </div>
          <div className="space-y-2">
            {project.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="flex gap-2.5 text-[12.5px] text-white/75 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                <span>{rec}</span>
              </div>
            )) || <p className="text-[12px] text-white/40">No suggestions recorded.</p>}
          </div>
        </div>
      </div>

      {/* Right Column: Complexity, Stack Details, and Dependencies */}
      <div className="space-y-6 lg:col-span-4">
        {/* Complexity Summary */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
          <h3 className="text-[12.5px] font-medium text-white/90">Codebase Complexity</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
              <span className="text-[10px] text-white/35 uppercase tracking-wider">Complexity</span>
              <div className="mt-1 text-[17px] font-medium text-white">
                {complexity.score || "Medium"}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
              <span className="text-[10px] text-white/35 uppercase tracking-wider">Estimated Lines</span>
              <div className="mt-1 text-[17px] font-medium text-white tabular-nums">
                {complexity.linesEstimate || "~N/A"}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Indexed Files</span>
            <div className="mt-0.5 text-[13.5px] text-white/70 leading-relaxed">
              Total files analyzed: <span className="text-white font-medium">{complexity.filesCount || data.fileSize ? "N/A" : 0}</span>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/45">
              {complexity.description || "Calculated size based on project structures."}
            </p>
          </div>
        </div>

        {/* Technology Specs */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
          <h3 className="text-[12.5px] font-medium text-white/90">Language & Frameworks</h3>
          
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-[10px] text-white/35 uppercase tracking-wider">Primary Languages</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {project.languages?.map((lang: string) => (
                  <span key={lang} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11.5px] text-white/80">
                    {lang}
                  </span>
                )) || <span className="text-[11.5px] text-white/45">N/A</span>}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.03]">
              <span className="text-[10px] text-white/35 uppercase tracking-wider">Frameworks & SDKs</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {project.frameworks && project.frameworks.length > 0 ? (
                  project.frameworks.map((f: string) => (
                    <span key={f} className="rounded-md border border-violet-500/10 bg-violet-500/5 px-2 py-0.5 text-[11.5px] text-violet-300">
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-[11.5px] text-white/45">No framework detected</span>
                )}
              </div>
            </div>

            {project.patterns && project.patterns.length > 0 && (
              <div className="pt-2 border-t border-white/[0.03]">
                <span className="text-[10px] text-white/35 uppercase tracking-wider">Detected Design Patterns</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.patterns.map((pat: string) => (
                    <span key={pat} className="rounded-md border border-white/[0.05] bg-white/[0.01] px-2 py-0.5 text-[11.5px] text-white/60">
                      {pat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Dependencies */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
          <h3 className="text-[12.5px] font-medium text-white/90">Package Dependencies ({Object.keys(dependencies).length})</h3>
          <div className="mt-4 max-h-[220px] overflow-y-auto divide-y divide-white/[0.03] pr-1 [scrollbar-width:thin]">
            {Object.keys(dependencies).length > 0 ? (
              Object.entries(dependencies).map(([pkg, ver]: [string, any]) => (
                <div key={pkg} className="flex items-center justify-between py-2 text-[12px]">
                  <span className="font-mono text-white/85 truncate max-w-[200px]" title={pkg}>{pkg}</span>
                  <span className="font-mono text-white/45 tabular-nums shrink-0">{ver}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-[12px] text-white/35">
                No dependencies listed in configuration.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
