"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experience } from "@/lib/data";

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 md:px-8">
      <SectionHeading
        index="03"
        eyebrow="Experience"
        title={
          <>
            Shipping to <span className="text-gradient">production</span> since 2021.
          </>
        }
        description="Client platforms, AI products and real-time apps, delivered end to end."
      />

      <ol ref={listRef} className="relative">
        {/* track + progress line drawn as you scroll */}
        <div className="absolute top-2 bottom-2 left-[5px] w-px bg-line md:left-[calc(12.5rem+5px)]" />
        <motion.div
          style={{ scaleY }}
          className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-gradient-to-b from-cyan via-violet to-fuchsia md:left-[calc(12.5rem+5px)]"
        />

        {experience.map((job) => (
          <motion.li
            key={job.company}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid gap-3 pb-12 pl-7 last:pb-0 md:grid-cols-[12.5rem_1fr] md:gap-10 md:pl-0"
          >
            {/* node on the line */}
            <span className="absolute top-1.5 left-0 grid size-[11px] place-items-center md:left-[12.5rem]">
              {job.current && <span className="absolute size-full animate-ping rounded-full bg-cyan/50" />}
              <span className="relative size-[11px] rounded-full border-2 border-cyan bg-void" />
            </span>

            <div className="md:pt-0.5 md:pr-8 md:text-right">
              <p className="font-mono text-sm whitespace-nowrap text-cyan">{job.period}</p>
              <p className="mt-0.5 text-xs text-muted">{job.location}</p>
            </div>

            <div
              className={`glass rounded-2xl p-5 md:ml-2 md:p-6 ${job.focus.ai ? "glow-border shadow-[0_0_50px_-20px] shadow-violet/60" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                  <h3 className="font-display text-xl font-semibold">{job.role}</h3>
                  <p className="mt-0.5 text-ink/70">{job.company}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {job.current && (
                    <span className="rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-emerald uppercase">
                      Current
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ${
                      job.focus.ai
                        ? "border border-violet/50 bg-violet/15 text-violet-200"
                        : "border border-white/10 text-ink/60"
                    }`}
                  >
                    {job.focus.ai && <Sparkles className="size-3" />}
                    {job.focus.label}
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5">
                {job.highlights.map((h) => (
                  <li key={h.title} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gradient-to-br from-cyan to-violet" />
                    <span>
                      <strong className="font-semibold text-ink">{h.title}</strong> {h.detail}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {job.tech.map((t) => (
                    <span key={t} className="rounded-md bg-white/4 px-2 py-1 font-mono text-[11px] text-cyan/90">
                      {t}
                    </span>
                  ))}
                </div>
                {job.links && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {job.links.map(({ label, href }) => {
                      const internal = href.startsWith("#");
                      return (
                        <a
                          key={href}
                          href={href}
                          target={internal ? undefined : "_blank"}
                          rel={internal ? undefined : "noopener noreferrer"}
                          className="inline-flex items-center gap-1 text-xs font-medium text-ink/80 transition hover:text-cyan"
                        >
                          {label}
                          {internal ? <ArrowDown className="size-3" /> : <ArrowUpRight className="size-3" />}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
