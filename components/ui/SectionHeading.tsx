import { Reveal } from "./Reveal";

type Props = { index: string; eyebrow: string; title: React.ReactNode; description?: string };

export function SectionHeading({ index, eyebrow, title, description }: Props) {
  return (
    <Reveal className="mb-14 max-w-3xl">
      <p className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-cyan uppercase">
        <span className="text-muted">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-cyan to-transparent" />
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-5 text-lg leading-relaxed text-muted">{description}</p>}
    </Reveal>
  );
}
