"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// WebGL must never render on the server; load the scene lazily on the client.
const ArchitectureScene = dynamic(() => import("./ArchitectureScene"), { ssr: false, loading: () => null });

const QUERY = "(max-width: 768px), (prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Small screens, reduced motion or weak CPUs get a lighter scene without bloom. */
const getLite = () => window.matchMedia(QUERY).matches || (navigator.hardwareConcurrency ?? 8) <= 4;

export function Scene() {
  const lite = useSyncExternalStore(subscribe, getLite, () => null);
  if (lite === null) return null;
  return <ArchitectureScene lite={lite} />;
}
