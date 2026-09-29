"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, FileDown, MapPin } from "lucide-react";
import { useRef } from "react";
import { Scene } from "@/components/three/Scene";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Typewriter } from "@/components/ui/Typewriter";
import { profile } from "@/lib/data";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-ink">{children}</span>;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Function mappers keep opacity on the JS path; framer's native scroll-timeline
  // acceleration for opacity doesn't reliably update in every browser.
  const sceneOpacity = useTransform(scrollYProgress, (v) => 1 - Math.min(v / 0.8, 1));
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* 3D agent graph */}
      <motion.div style={{ opacity: sceneOpacity, scale: sceneScale }} className="absolute inset-0">
        <div className="size-full opacity-40 md:opacity-100">
          <Scene />
        </div>
      </motion.div>

      {/* Readability gradients over the canvas */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-void)_85%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-void via-void/80 to-transparent lg:w-1/2" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />

      <motion.div
        style={{ y: copyY }}
        className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-5 pt-28 pb-12 md:px-8 short:pt-24 short:pb-6"
      >
        <div className="pointer-events-auto max-w-xl lg:max-w-[48%]">
          <motion.div
            {...fadeUp(0.2)}
            className="glass mb-6 inline-flex short:mb-4 items-center gap-2.5 rounded-full px-4 py-1.5 text-xs text-ink/80"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald" />
            </span>
            Open to AI Engineering roles
            <span className="h-3 w-px bg-white/15" />
            <MapPin className="size-3" /> {profile.location}
          </motion.div>

          <h1 className="font-display text-[clamp(3.25rem,min(8vw,10.5vh),6.25rem)] leading-[0.95] font-bold tracking-tighter">
            {profile.name.split(" ").map((word, i) => (
              <span key={word} className="block overflow-hidden pb-1.5">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.45 + i * 0.12, ease }}
                  className={`block ${i === 1 ? "animate-shimmer text-gradient" : ""}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-5 h-9 font-display short:mt-3 text-2xl font-medium text-ink md:text-3xl"
          >
            <Typewriter words={profile.roles} />
          </motion.p>

          <motion.p {...fadeUp(1.05)} className="mt-5 text-base leading-relaxed text-muted short:mt-3 md:text-lg">
            I design <Highlight>autonomous AI agents</Highlight> with LangGraph, CrewAI and agentic RAG, and ship them
            inside <Highlight>production-grade full-stack products</Highlight> built on Next.js, TypeScript and
            PostgreSQL.
          </motion.p>

          <motion.div {...fadeUp(1.2)} className="mt-8 flex flex-wrap items-center gap-3 short:mt-5">
            <MagneticButton href="#projects">
              View projects <ArrowRight className="size-4" />
            </MagneticButton>
            <MagneticButton href="#agent" variant="ghost">
              <Bot className="size-4" /> Ask my AI agent
              <span className="size-1.5 animate-pulse rounded-full bg-emerald" />
            </MagneticButton>
            <a
              href={profile.resume}
              download
              className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-ink/80 transition hover:text-cyan"
            >
              <FileDown className="size-4" />
              <span className="underline decoration-white/20 underline-offset-4 transition group-hover:decoration-cyan">
                Resume
              </span>
            </a>
          </motion.div>

          <motion.div {...fadeUp(1.35)} className="mt-7 flex items-center gap-4">
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-ink/70 transition hover:text-cyan"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-ink/70 transition hover:text-cyan"
            >
              <LinkedinIcon className="size-5" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
