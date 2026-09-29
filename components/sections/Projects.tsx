"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categoryLabels, type Project, profile, projects } from "@/lib/data";

const featured = projects.filter((p) => p.featured);
// Strongest first: multi-agent and production work before small demos.
const MORE_ORDER = [
  "feedwise",
  "rayeva",
  "sites60",
  "designbydial",
  "healthcare-langgraph",
  "code-review",
  "bookstore",
];
const more = projects.filter((p) => !p.featured).sort((a, b) => MORE_ORDER.indexOf(a.id) - MORE_ORDER.indexOf(b.id));

// Only link to code that is specific to the project, never the generic profile.
const repoOf = (p: Project) => (p.github && p.github !== profile.socials.github ? p.github : undefined);

function CategoryTag({ project }: { project: Project }) {
  const live = project.category === "production";
  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 font-mono text-[11px] ${
        live ? "border border-emerald/40 bg-emerald/10 text-emerald" : "border border-white/10 text-ink/70"
      }`}
    >
      {live && <span className="size-1.5 rounded-full bg-emerald" />}
      {categoryLabels[project.category]}
    </span>
  );
}

function ProjectLinks({ project, compact = false }: { project: Project; compact?: boolean }) {
  const repo = repoOf(project);
  if (!repo && !project.demo) return null;
  const base = compact
    ? "inline-flex items-center gap-1 text-xs font-medium text-ink/80 transition hover:text-cyan"
    : "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:border-cyan/50 hover:text-cyan";
  return (
    <div className="flex flex-wrap gap-3">
      {repo && (
        <a href={repo} target="_blank" rel="noopener noreferrer" className={base}>
          <GithubIcon className="size-4" /> Code
        </a>
      )}
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className={base}>
          Live <ArrowUpRight className="size-4" />
        </a>
      )}
    </div>
  );
}

/** Vertical architecture pipeline with a pulse travelling through the steps. */
function Pipeline({ steps }: { steps: string[] }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-void/60 p-5">
      <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Architecture</p>
      <ol className="relative space-y-3">
        <span className="absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-cyan/60 via-violet/50 to-fuchsia/60" />
        <motion.span
          aria-hidden
          className="absolute left-[8px] size-[7px] rounded-full bg-cyan shadow-[0_0_10px_2px] shadow-cyan"
          animate={{ top: ["8%", "88%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
        />
        {steps.map((step, i) => (
          <li key={step} className="relative flex items-center gap-3">
            <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border border-cyan/40 bg-void font-mono text-[10px] text-cyan">
              {i + 1}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-xs text-ink/85">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal className="glass glow-border grid gap-8 rounded-3xl p-6 md:p-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">0{index + 1}</span>
          <CategoryTag project={project} />
        </div>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-1 font-mono text-xs tracking-wider text-cyan uppercase">{project.subtitle}</p>
        <p className="mt-4 leading-relaxed text-muted">{project.description}</p>
        <ul className="mt-5 space-y-2">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-sm text-ink/85">
              <Check className="mt-0.5 size-4 shrink-0 text-cyan" />
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-ink/70">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 lg:mt-auto lg:pt-6">
          <ProjectLinks project={project} />
        </div>
      </div>
      <div className="lg:self-center">
        <Pipeline steps={project.flow} />
      </div>
    </Reveal>
  );
}

function CompactCard({ project }: { project: Project }) {
  return (
    <article className="glass group flex h-full w-[82vw] max-w-sm shrink-0 snap-start flex-col rounded-2xl p-5 transition-colors hover:border-cyan/40 md:w-auto md:max-w-none">
      <CategoryTag project={project} />
      <h3 className="mt-3 font-display text-lg font-semibold">{project.title}</h3>
      <p className="mt-0.5 font-mono text-[11px] tracking-wider text-cyan/90 uppercase">{project.subtitle}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{project.description}</p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10.5px] text-ink/65">
              {t}
            </span>
          ))}
        </div>
        <ProjectLinks project={project} compact />
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 md:px-8">
      <SectionHeading
        index="04"
        eyebrow="Projects"
        title={
          <>
            Agents, pipelines & <span className="text-gradient">products</span>.
          </>
        }
        description="Three case studies in depth, with the architecture behind each one, then more of what I've built."
      />

      <div className="space-y-6">
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} project={p} index={i} />
        ))}
      </div>

      <h3 className="mt-20 mb-6 font-display text-2xl font-semibold">More projects</h3>

      {/* Swipeable row on mobile, grid on larger screens */}
      <Reveal className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 scrollbar-none md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
        {more.map((p) => (
          <CompactCard key={p.id} project={p} />
        ))}
        <a
          href={profile.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-[82vw] max-w-sm shrink-0 snap-start flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-white/15 p-5 transition-colors hover:border-cyan/50 md:w-auto md:max-w-none"
        >
          <GithubIcon className="size-7 text-ink/70 transition group-hover:text-cyan" />
          <span className="font-display text-lg font-semibold">More on GitHub</span>
          <span className="text-sm text-muted">Source code, experiments and everything else I&apos;m building.</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-cyan">
            github.com/Nidhi-Sharma-1612 <ArrowUpRight className="size-4" />
          </span>
        </a>
      </Reveal>
      <p className="mt-2 text-center font-mono text-[11px] text-muted md:hidden">Swipe for more →</p>
    </section>
  );
}
