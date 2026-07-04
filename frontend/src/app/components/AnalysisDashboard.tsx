import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Gauge,
  FileText,
  Bug,
  Sliders,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAnalysisHistory,
  fetchUnifiedAnalysis,
  uploadUnifiedAnalysis,
  runWorkspaceAnalysis,
  deleteAnalysis,
} from "../services/chatService";

import { AnalysisHistory } from "./AnalysisHistory";
import { OverviewTab } from "./analysis/OverviewTab";
import { ProjectTab } from "./analysis/ProjectTab";
import { BugsTab } from "./analysis/BugsTab";
import { CodeReviewTab } from "./analysis/CodeReviewTab";
import { SecurityTab } from "./analysis/SecurityTab";
import { DocumentationTab } from "./analysis/DocumentationTab";
import { CollaborationTab } from "./analysis/CollaborationTab";
import { DashboardSkeleton, AnalysisHistorySkeleton } from "./Skeleton";

type Tab = "overview" | "project" | "bugs" | "review" | "security" | "documentation" | "collaboration";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "project", label: "Project Analysis", icon: FolderOpen },
  { id: "bugs", label: "Bug Detection", icon: Bug },
  { id: "review", label: "Code Review", icon: Sliders },
  { id: "security", label: "Security Audit", icon: ShieldCheck },
  { id: "documentation", label: "Documentation", icon: Sparkles },
  { id: "collaboration", label: "Collaboration", icon: Users },
];

interface AnalysisDashboardProps {
  currentUser: any;
}

export function AnalysisDashboard({ currentUser }: AnalysisDashboardProps) {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  const [history, setHistory] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any | null>(null);
  
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const loadHistory = async () => {
    try {
      const res = await fetchAnalysisHistory();
      setHistory(res);
    } catch (err: any) {
      toast.error(`Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelectReport = async (id: string) => {
    setLoadingReport(true);
    try {
      const details = await fetchUnifiedAnalysis(id);
      setReportData(details);
      setActiveReportId(id);
      setActiveTab("overview");
    } catch (err: any) {
      toast.error(`Failed to load details: ${err.message}`);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress("Extracting project archive...");
    
    // Simulate step timers for smooth UX
    const steps = [
      { t: "Extracting project archive...", d: 1500 },
      { t: "Profiling language files...", d: 3500 },
      { t: "Running static analysis engines...", d: 6500 },
      { t: "Triggering security audit models...", d: 10500 },
      { t: "Synthesizing AI docs & guides...", d: 16500 },
    ];
    
    const timers: number[] = [];
    steps.forEach((step) => {
      const timer = window.setTimeout(() => {
        setUploadProgress(step.t);
      }, step.d);
      timers.push(timer);
    });

    try {
      const result = await uploadUnifiedAnalysis(file);
      timers.forEach(clearTimeout);
      toast.success(`${file.name} successfully analyzed`);
      await loadHistory();
      setReportData(result);
      setActiveReportId(result.id);
      setActiveTab("overview");
    } catch (err: any) {
      timers.forEach(clearTimeout);
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleWorkspaceScan = async (path: string) => {
    setUploading(true);
    setUploadProgress("Reading workspace directory...");
    
    const steps = [
      { t: "Reading workspace directory...", d: 1500 },
      { t: "Profiling language files...", d: 3500 },
      { t: "Running static analysis engines...", d: 6500 },
      { t: "Triggering security audit models...", d: 10500 },
      { t: "Synthesizing AI docs & guides...", d: 16500 },
    ];
    
    const timers: number[] = [];
    steps.forEach((step) => {
      const timer = window.setTimeout(() => {
        setUploadProgress(step.t);
      }, step.d);
      timers.push(timer);
    });

    try {
      const result = await runWorkspaceAnalysis(path);
      timers.forEach(clearTimeout);
      toast.success("Workspace successfully analyzed");
      await loadHistory();
      setReportData(result);
      setActiveReportId(result.id);
      setActiveTab("overview");
    } catch (err: any) {
      timers.forEach(clearTimeout);
      toast.error(`Workspace analysis failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this codebase scan record?")) {
      try {
        await deleteAnalysis(id);
        toast.success("Record deleted");
        if (activeReportId === id) {
          setActiveReportId(null);
          setReportData(null);
        }
        await loadHistory();
      } catch (err: any) {
        toast.error(`Failed to delete: ${err.message}`);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-16 sm:px-8">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-5">
        {activeReportId ? (
          <button
            onClick={() => {
              setActiveReportId(null);
              setReportData(null);
            }}
            className="inline-flex items-center gap-1.5 text-[12px] text-white/45 transition hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to History
          </button>
        ) : (
          <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Nebula Registry
          </div>
        )}

        <button
          onClick={loadHistory}
          disabled={loadingHistory || uploading}
          className="rounded-lg p-2 text-white/50 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
          title="Refresh History"
        >
          <RefreshCw className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`} />
        </button>
      </div>

      {activeReportId && reportData ? (
        <>
          {/* Diagnostic View Title Hero */}
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-6">
            <div className="absolute -right-12 -top-16 h-56 w-1/3 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 opacity-[0.12] blur-3xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[9.5px] tracking-[0.3em] text-violet-300 uppercase font-semibold">
                  Unified Codebase Diagnosis
                </div>
                <h1
                  className="mt-1 text-white/95 leading-none"
                  style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}
                >
                  {reportData.projectName || reportData.fileName}
                </h1>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/45">
                  <span>File: <span className="text-white/70">{reportData.fileName}</span></span>
                  <span>• Type: <span className="text-white/70">{reportData.projectType}</span></span>
                  <span>• Languages: <span className="text-white/70">{reportData.languages?.join(", ")}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Panel Tabs Bar */}
          <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01] p-1 [scrollbar-width:none]">
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] transition ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="analysis-tab"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <t.icon className="relative h-3.5 w-3.5 opacity-80" />
                  <span className="relative font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View Shell */}
          {loadingReport ? (
            <DashboardSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {activeTab === "overview" && <OverviewTab data={reportData} />}
                {activeTab === "project" && <ProjectTab data={reportData} />}
                {activeTab === "bugs" && <BugsTab data={reportData} currentUser={currentUser} />}
                {activeTab === "review" && <CodeReviewTab data={reportData} currentUser={currentUser} />}
                {activeTab === "security" && <SecurityTab data={reportData} currentUser={currentUser} />}
                {activeTab === "documentation" && <DocumentationTab data={reportData} />}
                {activeTab === "collaboration" && <CollaborationTab data={reportData} currentUser={currentUser} />}
              </motion.div>
            </AnimatePresence>
          )}
        </>
      ) : (
        /* History & Upload Viewer list */
        <>
          <div className="mb-6">
            <h1
              className="text-white/95 leading-none"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38 }}
            >
              Unified Developer Intelligence
            </h1>
            <p className="mt-2.5 max-w-xl text-[13px] text-white/55 leading-normal">
              Extract and compile detailed static diagnostics for security postures, OWASP risks, dependency trees, and code quality anomalies.
            </p>
          </div>

          {loadingHistory ? (
            <AnalysisHistorySkeleton />
          ) : (
            <AnalysisHistory
              history={history}
              onSelect={handleSelectReport}
              onUpload={handleUpload}
              onWorkspaceScan={handleWorkspaceScan}
              onDelete={handleDelete}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}
        </>
      )}
    </div>
  );
}
