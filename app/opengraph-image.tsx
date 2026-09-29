import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const alt = `${profile.name}, AI Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const chips = ["LangGraph", "CrewAI", "LlamaIndex", "Agentic RAG", "Next.js", "TypeScript"];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "radial-gradient(circle at 80% 30%, #3b1d7a 0%, #04050d 55%)",
        color: "#e6e9ff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, color: "#22d3ee", letterSpacing: 6 }}>PORTFOLIO</div>
      <div style={{ fontSize: 96, fontWeight: 800, marginTop: 16 }}>{profile.name}</div>
      <div
        style={{
          fontSize: 44,
          marginTop: 8,
          backgroundImage: "linear-gradient(90deg, #22d3ee, #8b5cf6, #e879f9)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        AI Engineer · Agentic AI · Full Stack
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 48 }}>
        {chips.map((c) => (
          <div
            key={c}
            style={{
              fontSize: 24,
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,255,0.35)",
              color: "#c7cdf5",
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
