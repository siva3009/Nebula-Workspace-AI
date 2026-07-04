import { motion } from "motion/react";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Grain noise */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Floating gradient blobs — kept soft so they never compete with content */}
      <motion.div
        className="absolute -top-48 -left-32 h-[42rem] w-[42rem] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0) 70%)",
        }}
        animate={{ x: [0, 60, -10, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -right-48 h-[36rem] w-[36rem] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 70%)",
        }}
        animate={{ x: [0, -40, 20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-14rem] left-1/3 h-[40rem] w-[40rem] rounded-full blur-[180px]"
        style={{
          background:
            "radial-gradient(circle, rgba(244,114,182,0.1) 0%, rgba(244,114,182,0) 70%)",
        }}
        animate={{ x: [0, 40, -40, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        }}
      />
    </div>
  );
}
