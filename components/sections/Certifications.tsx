import { ArrowUpRight, Award, BadgeCheck, GraduationCap, Medal } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { type Certification, certifications, education } from "@/lib/data";

const featured = certifications.find((c) => c.featured);
const others = certifications.filter((c) => !c.featured);

function VerifyLink({ cert }: { cert: Certification }) {
  if (!cert.url) return null;
  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verify ${cert.title}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-cyan transition hover:underline"
    >
      Verify <ArrowUpRight className="size-3.5" />
    </a>
  );
}

export function Certifications() {
  return (
    <section id="credentials" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 md:px-8">
      <SectionHeading
        index="06"
        eyebrow="Credentials"
        title={
          <>
            Certified in <span className="text-gradient">agentic AI</span>, grounded in CS.
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Featured certification */}
        {featured && (
          <Reveal className="glass glow-border relative overflow-hidden rounded-3xl p-7 shadow-[0_0_60px_-24px] shadow-cyan/60">
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-cyan/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl border border-cyan/40 bg-cyan/10">
                <BadgeCheck className="size-6 text-cyan" />
              </span>
              <span className="rounded-full border border-emerald/40 bg-emerald/10 px-2.5 py-1 font-mono text-[10.5px] tracking-wider text-emerald uppercase">
                Latest · {featured.date}
              </span>
            </div>
            <p className="relative mt-6 font-mono text-[11px] tracking-[0.2em] text-cyan uppercase">Certification</p>
            <h3 className="relative mt-2 font-display text-3xl leading-tight font-semibold">{featured.title}</h3>
            <p className="relative mt-1.5 text-ink/70">{featured.issuer}</p>
            <div className="relative mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <a href="#projects" className="text-sm text-ink/80 transition hover:text-cyan">
                See it applied in my agent projects ↓
              </a>
              <VerifyLink cert={featured} />
            </div>
          </Reveal>
        )}

        {/* Degree */}
        {education.map((ed) => (
          <Reveal key={ed.degree} delay={0.08} className="glass relative overflow-hidden rounded-3xl p-7">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl border border-violet/40 bg-violet/10">
                <GraduationCap className="size-6 text-violet" />
              </span>
              <span className="font-mono text-xs text-muted">{ed.period}</span>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-violet uppercase">Education</p>
            <h3 className="mt-2 font-display text-2xl leading-tight font-semibold">{ed.degree}</h3>
            <p className="mt-1.5 text-ink/70">{ed.school}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <p>
                <span className="font-display text-3xl font-bold text-gradient">{ed.score}</span>
                <span className="ml-2 text-xs text-muted">aggregate</span>
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
                <Medal className="size-3.5" /> {ed.honors}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Other courses */}
      <Reveal delay={0.12} className="mt-5 glass rounded-3xl px-6 py-5">
        <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Also completed</p>
        <ul className="divide-y divide-white/5">
          {others.map((c) => (
            <li key={c.title} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <Award className="size-4 shrink-0 text-violet" />
              <p className="min-w-0 flex-1 text-sm font-medium">
                {c.title} <span className="font-normal text-muted">· {c.issuer}</span>
              </p>
              <div className="flex items-center gap-4 pl-8 sm:pl-0">
                {c.date && <span className="font-mono text-xs text-muted">{c.date}</span>}
                <VerifyLink cert={c} />
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
