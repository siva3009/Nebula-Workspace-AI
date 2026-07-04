import { useRef, useState, useCallback } from "react";
import {
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  Wand2,
  Globe,
  CornerDownLeft,
} from "lucide-react";

interface Props {
  onSend: (s: string) => void;
  onOpenModel: () => void;
  onAttachFiles: (files: File[]) => void;
  modelName: string;
}

const MAX_CHARS = 8000;

export function Composer({ onSend, onOpenModel, onAttachFiles, modelName }: Props) {
  const [val, setVal] = useState("");
  const [webOn, setWebOn] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!val.trim()) return;
    onSend(val.trim());
    setVal("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onAttachFiles(files);
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [onAttachFiles],
  );

  const autosize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-5">
      <div className="relative">
        <div className="pointer-events-none absolute -inset-px rounded-[22px] bg-gradient-to-r from-violet-500/25 via-fuchsia-400/10 to-sky-400/25 opacity-50 blur-lg" />

        <div className="relative rounded-[22px] border border-white/[0.09] bg-[#0F0F11]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] focus-within:border-white/20">
          {/* Hidden file input for Attach button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.txt,.md"
            style={{ display: "none" }}
          />

          <div className="flex items-end gap-2 px-4 pt-3.5">
            <textarea
              ref={ref}
              value={val}
              onChange={(e) => {
                setVal(e.target.value.slice(0, MAX_CHARS));
                autosize(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message Nebula — ask, attach, or describe…"
              rows={1}
              className="flex-1 resize-none bg-transparent py-1 text-[14.5px] leading-relaxed text-white/95 outline-none placeholder:text-white/30"
              style={{ minHeight: 28, maxHeight: 220 }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex items-center gap-0.5">
              <ToolBtn
                icon={Paperclip}
                label="Attach"
                onClick={() => fileInputRef.current?.click()}
              />
              <ToolBtn icon={ImageIcon} label="Image" />
              <ToggleToolBtn
                icon={Globe}
                label="Web"
                active={webOn}
                onClick={() => setWebOn((v) => !v)}
              />
              <ToolBtn icon={Wand2} label="Tools" />
            </div>

            <div className="flex items-center gap-2">
              {val.length > MAX_CHARS * 0.75 && (
                <span
                  className={`text-[10.5px] tabular-nums tracking-wider ${
                    val.length >= MAX_CHARS ? "text-rose-300" : "text-white/35"
                  }`}
                >
                  {val.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              )}

              <button
                onClick={onOpenModel}
                className="hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/70 transition hover:bg-white/[0.05] hover:text-white sm:flex"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                <span>{modelName}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>

              <button
                title="Voice input"
                className="grid h-8 w-8 place-items-center rounded-lg text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                onClick={submit}
                disabled={!val.trim()}
                title="Send (Enter)"
                className="group relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white text-[#0A0A0B] transition disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/30"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-violet-300 via-white to-sky-300 opacity-0 transition group-enabled:group-hover:opacity-100" />
                <ArrowUp className="relative h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-white/30">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/50">
              ⏎
            </kbd>
            send
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/50">
              ⇧⏎
            </kbd>
            new line
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tracking-wider text-white/50">
              ⌘K
            </kbd>
            command
          </span>
        </div>
        <span>Nebula can make mistakes — verify important info.</span>
      </div>
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-white/45 transition hover:bg-white/[0.05] hover:text-white"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ToggleToolBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${label}: ${active ? "on" : "off"}`}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] transition ${
        active
          ? "bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-300/25"
          : "text-white/45 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// silence unused-import lint
void CornerDownLeft;
