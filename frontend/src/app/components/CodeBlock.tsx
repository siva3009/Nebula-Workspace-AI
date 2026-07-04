import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  language: string;
  filename?: string;
  code: string;
}

export function CodeBlock({ language, filename, code }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A0C]/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
          </div>
          <span className="ml-2 text-[11px] tracking-wider text-white/40 uppercase">
            {language}
          </span>
          {filename && (
            <>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[11px] text-white/55">
                {filename}
              </span>
            </>
          )}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/50 transition hover:bg-white/[0.05] hover:text-white"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed [scrollbar-color:rgba(255,255,255,0.12)_transparent] [scrollbar-width:thin] [scrollbar-gutter:stable]">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}

function highlight(code: string) {
  const esc = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(
      /\b(const|let|var|function|return|if|else|import|from|export|default|async|await|new|class|extends)\b/g,
      '<span style="color:#c4b5fd">$1</span>',
    )
    .replace(/(\/\/.*$)/gm, '<span style="color:#525266">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span style="color:#7dd3fc">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#f0abfc">$1</span>')
    .replace(
      /\b([A-Z][A-Za-z0-9]*)\b/g,
      '<span style="color:#fde68a">$1</span>',
    );
}
