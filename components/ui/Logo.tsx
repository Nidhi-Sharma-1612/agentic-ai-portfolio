import { useId } from "react";

// The "N" drawn as a tiny agent graph: four nodes joined by edges,
// inside a hexagon, with a data pulse travelling along the path.
const N_PATH = "M13 28 L13 12 L27 28 L27 12";
const HEXAGON = "M20 2.5 L35.2 11.25 L35.2 28.75 L20 37.5 L4.8 28.75 L4.8 11.25 Z";
const NODES: [number, number][] = [
  [13, 28],
  [13, 12],
  [27, 28],
  [27, 12],
];

export function Logo({ className = "size-9", animated = true }: { className?: string; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  const stroke = `logo-stroke-${id}`;
  const fill = `logo-fill-${id}`;
  const glow = `logo-glow-${id}`;

  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={stroke} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
        <linearGradient id={fill} x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.08" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={HEXAGON} fill={`url(#${fill})`} stroke={`url(#${stroke})`} strokeWidth="1.6" strokeLinejoin="round" />

      <path
        d={N_PATH}
        stroke={`url(#${stroke})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glow})`}
      />

      {NODES.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.6"
          fill="#04050d"
          stroke={i % 3 === 0 ? "#22d3ee" : "#c4b5fd"}
          strokeWidth="1.6"
        />
      ))}

      {animated && (
        <circle r="1.5" fill="#ecfeff" filter={`url(#${glow})`}>
          <animateMotion
            dur="2.6s"
            repeatCount="indefinite"
            path={N_PATH}
            keyPoints="0;1"
            keyTimes="0;1"
            calcMode="linear"
          />
        </circle>
      )}
    </svg>
  );
}
