"use client";

import { useEffect, useState } from "react";

/** Types, pauses, deletes and cycles through `words`. */
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    const done = !deleting && text === word;
    const cleared = deleting && text === "";

    const timeout = setTimeout(
      () => {
        if (done) return setDeleting(true);
        if (cleared) {
          setDeleting(false);
          return setIndex((i) => i + 1);
        }
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      },
      done ? 1800 : deleting ? 35 : 75,
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words]);

  return (
    <span className={className}>
      {/* screen readers get the full list once instead of every keystroke */}
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block w-[3px] animate-blink bg-cyan align-middle"
        style={{ height: "0.9em" }}
      />
    </span>
  );
}
