"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  download?: boolean;
  external?: boolean;
  className?: string;
};

/** A link-button that is gently pulled toward the cursor. */
export function MagneticButton({ href, children, variant = "primary", download, external, className = "" }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 28 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 28 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.06);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.12);
  };

  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-cyan to-violet text-void shadow-[0_0_40px_-8px] shadow-cyan/60 hover:shadow-cyan/90"
      : "glass text-ink hover:border-cyan/50 hover:text-cyan";

  return (
    <motion.a
      ref={ref}
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[box-shadow,color,border-color] duration-300 ${styles} ${className}`}
    >
      {children}
    </motion.a>
  );
}
