import { motion } from "motion/react";
import { useId } from "react";

type Size = "sm" | "md";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: Size;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const DIMS: Record<Size, { w: number; h: number; thumb: number; pad: number }> = {
  // 1px inner padding on both sides → thumb travel = w - thumb - 2*pad
  md: { w: 36, h: 22, thumb: 18, pad: 2 },
  sm: { w: 30, h: 18, thumb: 14, pad: 2 },
};

/**
 * Premium Nebula toggle.
 * - Perfectly centered thumb (math-driven, no eyeballing)
 * - Glassmorphism off-state, gradient on-state with soft glow
 * - Spring animation, accessible focus ring, hover lift, disabled state
 */
export function Toggle({
  checked,
  onChange,
  size = "md",
  disabled = false,
  label,
  className = "",
}: Props) {
  const id = useId();
  const { w, h, thumb, pad } = DIMS[size];
  const travel = w - thumb - pad * 2;

  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ width: w, height: h }}
      className={`group relative shrink-0 rounded-full transition-colors duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]
        ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
        ${
          checked
            ? "bg-gradient-to-r from-violet-500 to-sky-400 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_22px_-8px_rgba(139,92,246,0.65)]"
            : "bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] hover:bg-white/[0.12]"
        }
        ${className}`}
    >
      {/* Soft accent glow when on */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/40 to-sky-400/40 blur-md transition-opacity duration-200 ${
          checked ? "opacity-70" : "opacity-0"
        }`}
      />

      {/* Thumb */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: checked ? pad + travel : pad }}
        transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.6 }}
        style={{
          width: thumb,
          height: thumb,
          top: (h - thumb) / 2,
          left: 0,
        }}
        className="absolute rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(0,0,0,0.06)]"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-white/85"
        />
      </motion.span>
    </button>
  );
}
