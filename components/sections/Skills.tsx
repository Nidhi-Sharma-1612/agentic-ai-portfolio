"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Database, Layout, type LucideIcon, Search, Server } from "lucide-react";
import { useRef, useState } from "react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile, stackGroups } from "@/lib/data";

const icons: Record<string, LucideIcon> = {
  agents: Bot,
  llm: Search,
  backend: Server,
  frontend: Layout,
  data: Database,
};

export function Skills() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = stackGroups[activeIndex];

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = (activeIndex + delta + stackGroups.length) % stackGroups.length;
    setActiveIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="stack" className="relative scroll-mt-24 py-28">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          index="02"
          eyebrow="The Stack"
          title={
            <>
              Every layer of an <span className="text-gradient">AI product</span>, end to end.
            </>
          }
          description="From agent orchestration down to the database, and where I've actually used each tool."
        />

        <Reveal className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-5">
            {/* Tabs: horizontal scroll on mobile, vertical list on desktop */}
            <div
              role="tablist"
              aria-label="Skill areas"
              onKeyDown={onKeyDown}
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {stackGroups.map((g, i) => {
                const Icon = icons[g.id] ?? Bot;
                const selected = i === activeIndex;
                return (
                  <button
                    key={g.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`stack-tab-${g.id}`}
                    aria-selected={selected}
                    aria-controls="stack-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveIndex(i)}
                    className={`relative isolate flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors lg:py-3.5 ${
                      selected ? "text-white" : "text-ink/65 hover:bg-white/3 hover:text-ink"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="stack-tab"
                        className="absolute inset-0 -z-10 rounded-xl border border-cyan/35 bg-gradient-to-r from-cyan/12 to-violet/8 shadow-[0_0_30px_-12px] shadow-cyan/60"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className={`size-4 shrink-0 ${selected ? "text-cyan" : ""}`} />
                    <span className="font-medium whitespace-nowrap">{g.name}</span>
                    <span className="ml-auto hidden font-mono text-[11px] text-muted lg:inline">
                      {g.core.length + g.also.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* The portfolio itself is proof of the stack */}
            <div className="hidden rounded-2xl border border-white/10 bg-white/3 p-4 lg:block">
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">This site</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Built with Next.js, TypeScript, Three.js and the Vercel AI SDK, including the live agent below.
              </p>
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan hover:underline"
              >
                <GithubIcon className="size-4" /> View on GitHub
              </a>
            </div>
          </div>

          {/* Detail panel */}
          <div
            role="tabpanel"
            id="stack-panel"
            aria-labelledby={`stack-tab-${group.id}`}
            className="glass glow-border relative min-h-105 overflow-hidden rounded-3xl p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-display text-2xl font-semibold">{group.name}</h3>
                <p className="mt-1.5 text-muted">{group.tagline}</p>

                <p className="mt-7 mb-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Core</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {group.core.map((skill, i) => (
                    <motion.li
                      key={skill.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3 transition-colors hover:border-cyan/40"
                    >
                      <p className="font-semibold text-ink">{skill.name}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-muted">Used in</span>
                        {skill.usedIn.map((where) => (
                          <span
                            key={where}
                            className="rounded-md bg-cyan/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan/90"
                          >
                            {where}
                          </span>
                        ))}
                      </p>
                    </motion.li>
                  ))}
                </ul>

                <p className="mt-7 mb-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                  Also worked with
                </p>
                <ul className="flex flex-wrap gap-2">
                  {group.also.map((tool) => (
                    <li key={tool} className="rounded-lg border border-white/10 px-2.5 py-1 text-sm text-ink/70">
                      {tool}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
