"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks, profile } from "@/lib/data";
import { CommandPalette } from "./CommandPalette";
import { Logo } from "./Logo";

export function Navbar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Highlight whichever section occupies the middle of the viewport.
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ${
            scrolled
              ? "border border-white/15 bg-void/70 shadow-[0_10px_40px_-10px_rgb(34_211_238/0.35),inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-xl backdrop-saturate-150"
              : "border border-transparent"
          }`}
        >
          <a href="#top" className="group flex items-center gap-2.5" aria-label="Back to top">
            <span className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan to-violet opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60" />
              <Logo className="relative size-10 transition-transform duration-500 group-hover:rotate-[30deg]" />
            </span>
            <span className="hidden font-display font-semibold tracking-tight sm:block">{profile.name}</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`relative isolate rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    active === id ? "font-medium text-white" : "text-ink/75 hover:text-white"
                  }`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/[0.07] ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-void transition hover:bg-cyan sm:block"
            >
              Hire me
            </a>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="grid size-9 place-items-center rounded-lg border border-line lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-4 top-20 z-40 rounded-2xl p-3 lg:hidden border border-white/15 bg-void/70 shadow-[0_10px_40px_-10px_rgb(34_211_238/0.35),inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-xl backdrop-saturate-150"
          >
            {navLinks.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-ink hover:bg-white/5"
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
