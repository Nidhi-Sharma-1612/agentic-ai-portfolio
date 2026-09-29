"use client";

import { animate, motion, useInView } from "framer-motion";
import { Award, BrainCircuit, Layers, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { aboutStory, nowNext, profile, stats, strengths } from "@/lib/data";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function Portrait() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] sm:max-w-sm">
      {/* soft glow behind the frame */}
      <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-cyan/30 via-violet/25 to-fuchsia/20 blur-2xl" />
      {/* animated gradient border: a spinning conic square clipped to the frame */}
      <div className="absolute -inset-[2px] overflow-hidden rounded-[1.9rem]">
        <div className="absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,var(--color-cyan),transparent_25%,var(--color-violet)_50%,transparent_75%,var(--color-cyan))]" />
      </div>
      <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-panel">
        {failed ? (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgb(34_211_238/0.25),transparent_60%),radial-gradient(circle_at_70%_80%,rgb(139_92_246/0.3),transparent_60%)]">
            <span className="font-display text-8xl font-bold text-gradient">NS</span>
          </div>
        ) : (
          <Image
            src={profile.photo}
            alt={`Portrait of ${profile.name}`}
            fill
            quality={90}
            sizes="(max-width: 768px) 90vw, 384px"
            className="object-cover object-[50%_20%]"
            onError={() => setFailed(true)}
          />
        )}
        {/* light fade at the very bottom so the badge sits cleanly */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-void/50 to-transparent" />
      </div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="absolute -right-4 -bottom-5 flex items-center gap-3 rounded-2xl border border-white/20 bg-void/65 px-4 py-3 shadow-[0_10px_40px_-8px_rgb(34_211_238/0.45),inset_0_1px_0_rgb(255_255_255/0.15)] backdrop-blur-xl backdrop-saturate-150 md:-right-10"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan/40 bg-cyan/15">
          <Award className="size-5 text-cyan" />
        </span>
        <div className="text-sm leading-tight">
          <p className="font-semibold text-white">Certified Agentic AI Engineer</p>
          <p className="mt-0.5 text-xs text-ink/80">Edureka · 2026</p>
        </div>
      </motion.div>
    </div>
  );
}

const strengthIcons = [BrainCircuit, Layers, Sparkles];

/** Renders **highlighted** phrases from the story copy. */
function Story({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
        chunk.startsWith("**") ? (
          <span key={i} className="font-medium text-ink">
            {chunk.slice(2, -2)}
          </span>
        ) : (
          chunk
        ),
      )}
    </>
  );
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-28 md:px-8">
      <SectionHeading
        index="01"
        eyebrow="About"
        title={
          <>
            A full-stack engineer who <span className="text-gradient">builds agents</span> that ship.
          </>
        }
      />
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:pt-2">
          <Portrait />
        </Reveal>

        <div>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-muted">
            {aboutStory.map((para) => (
              <p key={para.slice(0, 24)}>
                <Story text={para} />
              </p>
            ))}
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-7 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs"
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald" />
              <span className="w-8 text-muted">Now</span>
              <span className="text-ink">{nowNext.now}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan" />
              <span className="w-8 text-muted">Next</span>
              <span className="text-cyan">{nowNext.next}</span>
            </span>
          </Reveal>

          <p className="mt-10 mb-4 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">What I bring</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {strengths.map(({ title, text }, i) => {
              const Icon = strengthIcons[i];
              return (
                <Reveal key={title} delay={0.2 + i * 0.08} className="glass flex gap-3 rounded-2xl p-4 sm:block">
                  <Icon className="mt-0.5 size-5 shrink-0 text-cyan sm:mt-0 sm:mb-3" />
                  <div>
                    <p className="font-display font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.3} className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-bold text-gradient">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1.5 text-sm leading-snug text-ink/70">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
