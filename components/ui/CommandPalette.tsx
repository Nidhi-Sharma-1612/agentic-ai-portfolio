"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Copy, CornerDownLeft, FileDown, Hash, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { navLinks, profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";

type Action = { id: string; label: string; group: string; icon: React.ReactNode; run: () => void };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mounting the body only while open gives every open a fresh query/selection.
  return <AnimatePresence>{open && <PaletteBody onClose={onClose} />}</AnimatePresence>;
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const actions = useMemo<Action[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    const open = (url: string) => () => window.open(url, "_blank", "noopener");
    return [
      ...navLinks.map((l) => ({
        id: l.id,
        label: l.label,
        group: "Navigate",
        icon: <Hash className="size-4" />,
        run: go(l.id),
      })),
      {
        id: "ask",
        label: "Ask my AI agent a question",
        group: "Actions",
        icon: <Bot className="size-4" />,
        run: go("agent"),
      },
      {
        id: "copy",
        label: "Copy email address",
        group: "Actions",
        icon: <Copy className="size-4" />,
        run: () => navigator.clipboard.writeText(profile.email),
      },
      {
        id: "resume",
        label: "Download resume",
        group: "Actions",
        icon: <FileDown className="size-4" />,
        run: open(profile.resume),
      },
      {
        id: "gh",
        label: "Open GitHub",
        group: "Links",
        icon: <GithubIcon className="size-4" />,
        run: open(profile.socials.github),
      },
      {
        id: "li",
        label: "Open LinkedIn",
        group: "Links",
        icon: <LinkedinIcon className="size-4" />,
        run: open(profile.socials.linkedin),
      },
    ];
  }, []);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const execute = (action?: Action) => {
    if (!action) return;
    onClose();
    action.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(filtered.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + filtered.length) % Math.max(filtered.length, 1));
    }
    if (e.key === "Enter") execute(filtered[selected]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-start justify-center bg-void/70 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        className="glass w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl shadow-cyan/10"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results.</li>}
          {filtered.map((a, i) => (
            <li key={a.id}>
              {(i === 0 || filtered[i - 1].group !== a.group) && (
                <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">{a.group}</p>
              )}
              <button
                onMouseEnter={() => setSelected(i)}
                onClick={() => execute(a)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  i === selected ? "bg-cyan/10 text-ink" : "text-muted"
                }`}
              >
                <span className={i === selected ? "text-cyan" : ""}>{a.icon}</span>
                <span className="flex-1">{a.label}</span>
                {i === selected ? (
                  <CornerDownLeft className="size-3.5" />
                ) : (
                  <ArrowRight className="size-3.5 opacity-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
