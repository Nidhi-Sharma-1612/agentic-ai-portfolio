"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, Clock, Copy, FileDown, Loader2, Mail, MapPin, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { navLinks, profile } from "@/lib/data";

type FormState = "idle" | "sending" | "sent" | "error";

const facts = [
  { icon: Sparkles, label: "Looking for", value: "AI Engineer · Agentic AI · Full Stack AI" },
  { icon: MapPin, label: "Based in", value: `${profile.location} · IST (UTC+5:30)` },
  { icon: Clock, label: "Work setup", value: "Remote or hybrid" },
];

const field =
  "w-full rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-cyan/60 focus:ring-2 focus:ring-cyan/15";

function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setState("sending");
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (res?.ok) {
      setState("sent");
      form.reset();
      return;
    }
    const code = (await res?.json().catch(() => null))?.error;
    if (code === "not_configured" || !res) {
      // No email service configured: hand the message to the visitor's mail app.
      const body = `${data.message}\n\n— ${data.name}${data.company ? `, ${data.company}` : ""}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      setState("idle");
      return;
    }
    setState("error");
    setError(
      code === "rate_limited"
        ? "You've sent a few messages already. Please try again later, or email me directly."
        : code === "invalid"
          ? "Please check the fields: a valid email and a message of at least 10 characters."
          : "Something went wrong sending your message. Please email me directly.",
    );
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <span className="grid size-14 place-items-center rounded-full border border-emerald/40 bg-emerald/10">
              <Check className="size-7 text-emerald" />
            </span>
            <p className="mt-5 font-display text-2xl font-semibold">Message sent</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Thanks for reaching out. I&apos;ll reply to the email you shared.
            </p>
            <button onClick={() => setState("idle")} className="mt-6 text-sm text-cyan hover:underline">
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink/80">Name</span>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className={field}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink/80">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={120}
                  autoComplete="email"
                  placeholder="jane@company.com"
                  className={field}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink/80">
                Company <span className="text-muted">(optional)</span>
              </span>
              <input
                name="company"
                maxLength={100}
                autoComplete="organization"
                placeholder="Acme AI"
                className={field}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink/80">Message</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Tell me about the role or project…"
                className={`${field} resize-none`}
              />
            </label>
            {/* Honeypot: hidden from people and screen readers, bots fill it in */}
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] size-px opacity-0"
            />

            {state === "error" && (
              <p
                role="alert"
                className="rounded-xl border border-fuchsia/30 bg-fuchsia/10 px-4 py-2.5 text-sm text-fuchsia"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-violet px-5 py-3 text-sm font-semibold text-void shadow-[0_0_40px_-10px] shadow-cyan/60 transition hover:shadow-cyan/90 disabled:opacity-60"
            >
              {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {state === "sending" ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden px-5 pt-28 pb-10 md:px-8">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_bottom,rgb(34_211_238/0.14),transparent_65%)]" />
      <div className="mx-auto max-w-6xl">
        <Reveal className="glass glow-border relative overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 -z-10 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
          <div className="grid gap-10 p-6 md:p-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            {/* Pitch + direct channels */}
            <div className="flex flex-col">
              <p className="font-mono text-xs tracking-[0.3em] text-cyan uppercase">07 · Contact</p>
              <h2 className="mt-5 font-display text-4xl leading-tight font-bold tracking-tight md:text-5xl">
                Let&apos;s build <span className="animate-shimmer text-gradient">intelligent products</span> together.
              </h2>
              <p className="mt-5 max-w-md text-muted">
                Hiring for an AI or full-stack role? Send me a message and I&apos;ll get back to you by email.
              </p>

              <ul className="mt-8 mb-8 space-y-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/4">
                      <Icon className="size-4 text-cyan" />
                    </span>
                    <span className="flex flex-col sm:flex-row sm:gap-2">
                      <span className="text-muted sm:w-24 sm:shrink-0">{label}</span>
                      <span className="text-ink/90">{value}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-white/10 bg-void/40 p-4 lg:mt-auto">
                <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Or reach me directly</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink transition hover:text-cyan"
                  >
                    <Mail className="size-4 shrink-0 text-cyan" />
                    <span className="truncate">{profile.email}</span>
                  </a>
                  <button
                    onClick={copyEmail}
                    aria-label="Copy email address"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-ink/80 transition hover:border-cyan/50 hover:text-cyan"
                  >
                    {copied ? <Check className="size-3.5 text-emerald" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                  {[
                    { icon: LinkedinIcon, label: "LinkedIn", href: profile.socials.linkedin },
                    { icon: GithubIcon, label: "GitHub", href: profile.socials.github },
                  ].map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-ink/85 transition hover:border-cyan/50 hover:text-cyan"
                    >
                      <Icon className="size-4" /> {label}
                    </a>
                  ))}
                  <a
                    href={profile.resume}
                    download
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-ink/85 transition hover:border-cyan/50 hover:text-cyan"
                  >
                    <FileDown className="size-4" /> Resume
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-3xl border border-white/10 bg-void/50 p-5 md:p-7">
              <ContactForm />
            </div>
          </div>
        </Reveal>

        <footer className="mt-14 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Back to top">
            <Logo className="size-8" animated={false} />
            <span className="font-display font-semibold">{profile.name}</span>
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {navLinks.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className="transition hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#top"
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-3.5 py-2 text-xs text-ink/80 transition hover:border-cyan/50 hover:text-cyan md:self-auto"
          >
            Back to top <ArrowUp className="size-3.5" />
          </a>
        </footer>
        <div className="mt-6 flex flex-col gap-2 pb-2 text-xs text-muted md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}. Designed & engineered by me.
          </p>
          <p className="font-mono">Next.js · TypeScript · Three.js · Framer Motion · AI SDK</p>
        </div>
      </div>
    </section>
  );
}
