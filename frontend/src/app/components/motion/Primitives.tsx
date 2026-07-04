import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "motion/react";

// Spring presets — tuned to feel premium across the app
export const SPRING = {
  hover: { type: "spring" as const, stiffness: 320, damping: 26, mass: 0.6 },
  press: { type: "spring" as const, stiffness: 560, damping: 32 },
  page: { type: "spring" as const, stiffness: 180, damping: 24 },
  enter: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

/**
 * HoverDepth — adds 3D-style tilt + depth on hover.
 * Wrap any card to get a subtle premium parallax response.
 */
export function HoverDepth({
  children,
  className = "",
  intensity = 6,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), SPRING.hover);
  const ry = useSpring(useMotionValue(0), SPRING.hover);
  const gx = useSpring(useMotionValue(50), SPRING.hover);
  const gy = useSpring(useMotionValue(50), SPRING.hover);
  const lift = useSpring(useMotionValue(0), SPRING.hover);

  const transform = useTransform(
    [rx, ry, lift] as any,
    ([x, y, z]: any) => `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) translateZ(${z}px)`,
  );

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * intensity);
    ry.set((px - 0.5) * intensity);
    gx.set(px * 100);
    gy.set(py * 100);
    lift.set(4);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {glow && (
        <motion.div
          aria-hidden
          style={{
            background: useTransform(
              [gx, gy] as any,
              ([x, y]: any) =>
                `radial-gradient(420px circle at ${x}% ${y}%, rgba(139,92,246,0.18), transparent 60%)`,
            ) as any,
          }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      {children}
    </motion.div>
  );
}

/**
 * Magnetic — button or icon attractor. Subtle pull toward cursor.
 */
export function Magnetic({
  children,
  className = "",
  strength = 14,
  ...rest
}: { children: ReactNode; className?: string; strength?: number } & HTMLMotionProps<"button">) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), SPRING.hover);
  const y = useSpring(useMotionValue(0), SPRING.hover);

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(Math.max(-strength, Math.min(strength, dx / 4)));
    y.set(Math.max(-strength, Math.min(strength, dy / 4)));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/**
 * Press — adds a tactile press-down feedback with optional ripple.
 */
export function Press({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const onMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((rs) => rs.filter((rr) => rr.id !== id)), 700);
  };

  return (
    <motion.button
      onMouseDown={onMouseDown}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.press}
      className={`relative overflow-hidden ${className}`}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ opacity: 0.35, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: r.x - 8, top: r.y - 8 }}
          className="pointer-events-none absolute h-4 w-4 rounded-full bg-white/30"
        />
      ))}
      {children}
    </motion.button>
  );
}

/**
 * Stagger — children fade up sequentially.
 */
export function Stagger({
  children,
  className = "",
  delay = 0,
  gap = 0.06,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shimmer — premium loading shimmer for skeleton-style placeholders.
 */
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-white/[0.04] ${className}`}>
      <motion.span
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />
    </div>
  );
}
