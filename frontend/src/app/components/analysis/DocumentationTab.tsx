import React, { useState } from "react";
import { FileText, Copy, Check, Terminal } from "lucide-react";

interface DocumentationTabProps {
  data: any; // UnifiedAnalysisResponseDto
}

type DocKey = "readme" | "architecture" | "apiDocs" | "setupGuide" | "deploymentGuide" | "envVariablesGuide" | "developerOnboarding";

const DOCS_META: { key: DocKey; label: string; file: string }[] = [
  { key: "readme", label: "README Guide", file: "README.md" },
  { key: "architecture", label: "Architecture", file: "ARCHITECTURE.md" },
  { key: "apiDocs", label: "API Reference", file: "API.md" },
  { key: "setupGuide", label: "Setup Guide", file: "SETUP.md" },
  { key: "deploymentGuide", label: "Deployment Guide", file: "DEPLOYMENT.md" },
  { key: "envVariablesGuide", label: "Environment Config", file: "ENV.md" },
  { key: "developerOnboarding", label: "Developer Onboarding", file: "ONBOARDING.md" },
];

export function DocumentationTab({ data }: DocumentationTabProps) {
  const docData = data.documentation || {};
  const [activeDoc, setActiveDoc] = useState<DocKey>("readme");
  const [copied, setCopied] = useState(false);

  const activeContent = docData[activeDoc] || `*No content generated for this guide.*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[500px]">
      {/* Doc selector sidebar (3 Cols) */}
      <div className="lg:col-span-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] tracking-wider text-white/30 uppercase">
          Generated Guides
        </div>
        {DOCS_META.map((doc) => {
          const isActive = activeDoc === doc.key;
          return (
            <button
              key={doc.key}
              onClick={() => {
                setActiveDoc(doc.key);
                setCopied(false);
              }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[12.5px] transition ${
                isActive
                  ? "bg-violet-500/[0.08] border border-violet-500/20 text-violet-200"
                  : "border border-transparent text-white/55 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4 opacity-70" />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{doc.label}</span>
                <span className="block text-[10px] text-white/30 truncate mt-0.5">{doc.file}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Doc content reader panel (9 Cols) */}
      <div className="lg:col-span-9 flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
        <header className="border-b border-white/[0.04] px-5 py-3.5 flex items-center justify-between gap-4 bg-white/[0.005]">
          <div>
            <h3 className="text-[13px] font-medium text-white/95">
              {DOCS_META.find((d) => d.key === activeDoc)?.label}
            </h3>
            <span className="font-mono text-[10px] text-white/35">
              Source: {DOCS_META.find((d) => d.key === activeDoc)?.file}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/80 transition hover:bg-white/[0.05]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Content</span>
              </>
            )}
          </button>
        </header>

        {/* Content Viewer body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[550px] [scrollbar-width:thin] bg-black/5 text-[13px] leading-relaxed text-white/80 select-text">
          <MarkdownRenderer text={activeContent} />
        </div>
      </div>
    </div>
  );
}

// Markdown parser
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const parsedElements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "text";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        parsedElements.push(
          <div key={`code-${i}`} className="my-4 overflow-hidden rounded-xl border border-white/[0.05]">
            <div className="bg-white/[0.02] border-b border-white/[0.04] px-4 py-1.5 flex items-center justify-between">
              <span className="text-[10px] tracking-wider text-white/40 uppercase font-mono">{codeLang}</span>
              <Terminal className="h-3.5 w-3.5 text-white/30" />
            </div>
            <pre className="overflow-x-auto bg-[#08080A] p-4 font-mono text-[11.5px] text-white/85 leading-normal [scrollbar-width:thin]">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        codeLines = [];
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim() || "text";
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Title / Headers
    if (line.startsWith("# ")) {
      parsedElements.push(
        <h1 key={i} className="text-lg font-semibold text-white/95 mt-5 mb-3 first:mt-0 border-b border-white/5 pb-2">
          {inlineStyles(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      parsedElements.push(
        <h2 key={i} className="text-base font-semibold text-white/95 mt-5 mb-2.5">
          {inlineStyles(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      parsedElements.push(
        <h3 key={i} className="text-[13.5px] font-semibold text-violet-300 mt-4 mb-2">
          {inlineStyles(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      parsedElements.push(
        <blockquote key={i} className="border-l-2 border-violet-400 bg-white/[0.02] px-4 py-2 my-3 text-[12.5px] text-white/60 italic rounded-r-md">
          {inlineStyles(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      parsedElements.push(
        <div key={i} className="flex gap-2.5 my-1.5 pl-2 leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
          <span className="flex-1 text-[12.5px]">{inlineStyles(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === "---") {
      parsedElements.push(<hr key={i} className="my-5 border-white/10" />);
      continue;
    }

    // Normal Paragraph
    if (line.trim()) {
      parsedElements.push(
        <p key={i} className="my-2 text-[12.5px] text-white/70 leading-relaxed">
          {inlineStyles(line)}
        </p>
      );
    } else {
      parsedElements.push(<div key={i} className="h-1.5" />);
    }
  }

  return <div className="space-y-1">{parsedElements}</div>;
}

// Map inline formats like bold and code backticks
function inlineStyles(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let index = 0;
  
  // Combine bold (**), and backtick (`) tags
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(index, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }

    const matchedText = match[0];
    if (matchedText.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white/95">
          {matchedText.slice(2, -2)}
        </strong>
      );
    } else if (matchedText.startsWith("`")) {
      parts.push(
        <code key={match.index} className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11.5px] text-violet-200">
          {matchedText.slice(1, -1)}
        </code>
      );
    }

    index = regex.lastIndex;
  }

  const textAfter = text.slice(index);
  if (textAfter) {
    parts.push(textAfter);
  }

  return parts.length ? parts : [text];
}
