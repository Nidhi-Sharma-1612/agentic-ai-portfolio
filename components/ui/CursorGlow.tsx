"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

/** Soft radial light that trails the cursor (desktop only). */
export function CursorGlow() {
  const x = useSpring(useMotionValue(-500), { stiffness: 120, damping: 25 });
  const y = useSpring(useMotionValue(-500), { stiffness: 120, damping: 25 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX - 250);
      y.set(e.clientY - 250);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none fixed top-0 left-0 z-0 hidden size-[500px] rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.08),transparent_65%)] md:block"
    />
  );
}
