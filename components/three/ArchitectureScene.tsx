"use client";

import { Edges, Line, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";

// A full-stack AI architecture as four stacked layers, with one request
// animated end to end: UI → API → agent → memory/RAG/tools/evals → API →
// Postgres → streamed back to the UI.

type Vec3 = [number, number, number];

const APP = "#22d3ee";
const AI = "#a78bfa";
const DATA = "#e879f9";
const PANEL = "#0b1030";

const LAYERS = [
  { name: "CLIENT", y: 2.2, color: APP },
  { name: "API", y: 0.75, color: APP },
  { name: "AI AGENT", y: -0.7, color: AI },
  { name: "DATA", y: -2.15, color: DATA },
];

// `port` is where packets enter/leave a component; `label` is where its name sits.
const NODES = {
  ui: { name: "Next.js UI", port: [0, 2.45, 0.05], label: [0, 3.45, 0], color: APP },
  api: { name: "API · Node.js", port: [0, 1.05, 0.2], label: [0, 1.55, 0], color: APP },
  llm: { name: "LLM Agent", port: [0, -0.2, 0], label: [-1.05, 0.15, 0], color: AI },
  tools: { name: "Tools", port: [-1.6, -0.42, 0.6], label: [-1.6, -0.02, 0.6], color: AI },
  memory: { name: "Memory", port: [1.35, -0.42, -0.85], label: [1.35, 0.02, -0.85], color: AI },
  evals: { name: "Evals", port: [1.6, -0.42, 0.6], label: [1.6, -0.02, 0.6], color: AI },
  postgres: { name: "Postgres", port: [-1.15, -1.75, 0.35], label: [-1.15, -1.2, 0.35], color: DATA },
  vector: { name: "Vector DB", port: [1.15, -1.75, 0.35], label: [1.15, -1.2, 0.35], color: DATA },
} satisfies Record<string, { name: string; port: Vec3; label: Vec3; color: string }>;
type NodeId = keyof typeof NODES;
const NODE_IDS = Object.keys(NODES) as NodeId[];

// One request's journey, one hop per step.
const HOPS: { from: NodeId; to: NodeId; text: string }[] = [
  { from: "ui", to: "api", text: "User sends a prompt" },
  { from: "api", to: "llm", text: "API invokes the agent" },
  { from: "llm", to: "memory", text: "Agent recalls context" },
  { from: "llm", to: "vector", text: "RAG searches the vector DB" },
  { from: "vector", to: "llm", text: "Relevant docs returned" },
  { from: "llm", to: "tools", text: "Agent calls a tool" },
  { from: "llm", to: "evals", text: "Answer is evaluated" },
  { from: "llm", to: "api", text: "Grounded answer returned" },
  { from: "api", to: "postgres", text: "Conversation saved" },
  { from: "api", to: "ui", text: "Answer streams to the UI" },
];
const HOP_SECONDS = 1.05;
const TRAIL = 8;

/** Request paths bow toward the viewer, responses bow away, so both stay visible. */
function hopCurve(from: NodeId, to: NodeId) {
  const a = new THREE.Vector3(...NODES[from].port);
  const b = new THREE.Vector3(...NODES[to].port);
  const mid = a.clone().lerp(b, 0.5);
  const sameLayer = Math.abs(a.y - b.y) < 0.5;
  if (sameLayer) mid.y += 0.45;
  else mid.z += a.y > b.y ? 0.55 : -0.55;
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

const CURVES = HOPS.map((h) => hopCurve(h.from, h.to));
const CURVE_POINTS = CURVES.map((c) => c.getPoints(40));

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// ---------------------------------------------------------------------------
// DOM label overlay (one React tree; positions written every frame)

type Overlay = {
  nodes: (HTMLSpanElement | null)[];
  layers: (HTMLSpanElement | null)[];
  caption: HTMLDivElement | null;
  step: HTMLSpanElement | null;
  text: HTMLSpanElement | null;
};
type OverlayRef = RefObject<Overlay>;
type FlowRef = RefObject<{ hop: number; t: number }>;

const tmp = new THREE.Vector3();

function place(
  group: THREE.Object3D,
  local: Vec3,
  el: HTMLElement | null | undefined,
  camera: THREE.Camera,
  size: { width: number; height: number },
  anchorX = "-50%",
) {
  if (!el) return;
  tmp.set(...local);
  group.localToWorld(tmp);
  tmp.project(camera);
  const x = (tmp.x * 0.5 + 0.5) * size.width;
  const y = (-tmp.y * 0.5 + 0.5) * size.height;
  el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(${anchorX}, -50%)`;
}

// Imperative writes live in plain functions: they run inside useFrame, and the
// React Compiler lint rejects mutating props-derived values inside components.
function writeFlow(flow: FlowRef, hop: number, t: number) {
  flow.current.hop = hop;
  flow.current.t = t;
}

function setActive(el: HTMLElement | null | undefined, active: boolean) {
  if (el) el.dataset.active = String(active);
}

function setCaption(o: Overlay, hop: number) {
  if (!o.step || !o.text) return;
  o.step.textContent = String(hop + 1).padStart(2, "0");
  o.text.textContent = HOPS[hop].text;
}

// ---------------------------------------------------------------------------
// Components

function Platform({ y, color }: { y: number; color: string }) {
  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={[4.8, 0.08, 3.2]} />
      <meshStandardMaterial color="#0b0f25" transparent opacity={0.55} roughness={0.6} metalness={0.2} />
      <Edges color={color} />
    </mesh>
  );
}

function BrowserWindow() {
  const bars: [number, number, number][] = [
    [-0.25, 0.18, 1.1],
    [-0.4, 0.02, 0.8],
    [-0.15, -0.14, 1.3],
  ];
  return (
    <group position={[0, 2.8, 0]}>
      <mesh>
        <boxGeometry args={[1.9, 1.15, 0.06]} />
        <meshStandardMaterial color={PANEL} emissive={APP} emissiveIntensity={0.08} />
        <Edges color={APP} />
      </mesh>
      <mesh position={[0, 0.49, 0.035]}>
        <boxGeometry args={[1.9, 0.16, 0.01]} />
        <meshBasicMaterial color="#16204a" />
      </mesh>
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <mesh key={c} position={[-0.82 + i * 0.12, 0.49, 0.045]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
      {bars.map(([x, y, w], i) => (
        <mesh key={i} position={[x + w / 2 - 0.55, y, 0.04]}>
          <boxGeometry args={[w, 0.07, 0.01]} />
          <meshBasicMaterial color={i === 2 ? AI : APP} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ServerBlock() {
  return (
    <group position={[0, 1.05, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial color={PANEL} emissive={APP} emissiveIntensity={0.06} />
        <Edges color={APP} />
      </mesh>
      {[0.12, 0, -0.12].map((y) => (
        <mesh key={y} position={[-0.2, y, 0.405]}>
          <boxGeometry args={[0.6, 0.035, 0.01]} />
          <meshBasicMaterial color={APP} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0.4, 0, 0.41]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="#34d399" toneMapped={false} />
      </mesh>
    </group>
  );
}

function LlmCore() {
  const shell = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!shell.current) return;
    shell.current.rotation.x += delta * 0.3;
    shell.current.rotation.y += delta * 0.4;
  });
  return (
    <group position={[0, -0.2, 0]}>
      <mesh>
        <sphereGeometry args={[0.42, 48, 48]} />
        <MeshDistortMaterial color="#4c1d95" emissive={AI} emissiveIntensity={0.6} distort={0.35} speed={2.5} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color={APP} wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DatabaseStack({ position, dotted = false }: { position: Vec3; dotted?: boolean }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, i * 0.2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.16, 40]} />
          <meshStandardMaterial color={PANEL} emissive={DATA} emissiveIntensity={0.12} />
          <Edges color={DATA} threshold={30} />
        </mesh>
      ))}
      {dotted &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.28, 0.5, Math.sin(a) * 0.28]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={DATA} toneMapped={false} />
            </mesh>
          );
        })}
    </group>
  );
}

/** Small AI-layer modules; they swell when the packet reaches them. */
function Module({ id, flow, children }: { id: NodeId; flow: FlowRef; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const [x, y, z] = NODES[id].port;
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const { hop, t } = flow.current;
    const active = HOPS[hop].to === id && t > 0.7;
    const s = THREE.MathUtils.damp(g.scale.x, active ? 1.35 : 1, 8, delta);
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} position={[x, y + 0.02, z]}>
      {children}
    </group>
  );
}

function Beams() {
  return (
    <>
      {CURVE_POINTS.map((pts, i) => (
        <Line key={i} points={pts} color={NODES[HOPS[i].to].color} lineWidth={1} transparent opacity={0.22} />
      ))}
    </>
  );
}

/** The travelling request: a bright packet with a fading trail. */
function Packet({ flow }: { flow: FlowRef }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const elapsed = clock.elapsedTime / HOP_SECONDS;
    const hop = Math.floor(elapsed) % HOPS.length;
    const t = elapsed % 1;
    writeFlow(flow, hop, t);
    material.current?.color.set(NODES[HOPS[hop].to].color);

    const head = easeInOut(Math.min(t / 0.85, 1));
    for (let k = 0; k < TRAIL; k++) {
      const tk = Math.max(head - k * 0.035, 0);
      CURVES[hop].getPoint(tk, dummy.position);
      dummy.scale.setScalar(k === 0 ? 1 : 0.85 - k * 0.09);
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, TRAIL]}>
      <sphereGeometry args={[0.07, 14, 14]} />
      <meshBasicMaterial ref={material} color={APP} toneMapped={false} />
    </instancedMesh>
  );
}

/** Writes label positions, active states and the step caption each frame. */
function OverlaySync({
  group,
  overlay,
  flow,
}: {
  group: RefObject<THREE.Group | null>;
  overlay: OverlayRef;
  flow: FlowRef;
}) {
  const lastHop = useRef(-1);
  useFrame(({ camera, size }) => {
    const g = group.current;
    const o = overlay.current;
    if (!g) return;
    const { hop, t } = flow.current;
    const { from, to } = HOPS[hop];

    NODE_IDS.forEach((id, i) => {
      const el = o.nodes[i];
      place(g, NODES[id].label, el, camera, size);
      setActive(el, id === to ? t > 0.55 : id === from && t < 0.45);
    });
    LAYERS.forEach((l, i) => place(g, [-2.4, l.y, 1.6], o.layers[i], camera, size, "-100%"));
    place(g, [0, 4.0, 0], o.caption, camera, size);

    if (hop !== lastHop.current) {
      lastHop.current = hop;
      setCaption(o, hop);
    }
  });
  return null;
}

function Architecture({ overlay }: { overlay: OverlayRef }) {
  const group = useRef<THREE.Group>(null);
  const flow = useRef({ hop: 0, t: 0 });
  const { viewport } = useThree();

  // Sit in the right half beside the copy; fit the stack to the room available.
  const wide = viewport.aspect > 1.15;
  const offsetX = wide ? viewport.width * 0.25 : 0;
  const scale = wide
    ? THREE.MathUtils.clamp(Math.min((viewport.width * 0.4) / 7, (viewport.height * 0.72) / 7.5), 0.45, 0.95)
    : 0.6;

  useFrame(({ clock, pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    // Gentle sway instead of a full spin so the layers stay readable.
    const sway = Math.sin(clock.elapsedTime * 0.25) * 0.18;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.5 + sway + pointer.x * 0.2, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.38 - pointer.y * 0.08, 3, delta);
  });

  return (
    <group ref={group} position={[offsetX, -0.6 * scale, 0]} scale={scale} rotation={[0.38, -0.5, 0]}>
      {LAYERS.map((l) => (
        <Platform key={l.name} y={l.y} color={l.color} />
      ))}
      <BrowserWindow />
      <ServerBlock />
      <LlmCore />
      <Module id="tools" flow={flow}>
        <mesh>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color={PANEL} emissive={AI} emissiveIntensity={0.25} />
          <Edges color={AI} />
        </mesh>
      </Module>
      <Module id="memory" flow={flow}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.42, 6]} />
          <meshStandardMaterial color={PANEL} emissive={AI} emissiveIntensity={0.25} />
          <Edges color={AI} />
        </mesh>
      </Module>
      <Module id="evals" flow={flow}>
        <mesh>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color={PANEL} emissive={AI} emissiveIntensity={0.3} />
          <Edges color={AI} />
        </mesh>
      </Module>
      <DatabaseStack position={[-1.15, -2.0, 0.35]} />
      <DatabaseStack position={[1.15, -2.0, 0.35]} dotted />
      <Beams />
      <Packet flow={flow} />
      <OverlaySync group={group} overlay={overlay} flow={flow} />
    </group>
  );
}

// ---------------------------------------------------------------------------

const hidden = { transform: "translate3d(-9999px, 0, 0)" };

export default function ArchitectureScene({ lite = false }: { lite?: boolean }) {
  const overlay = useRef<Overlay>({ nodes: [], layers: [], caption: null, step: null, text: null });

  return (
    <div className="relative size-full">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 5, 6]} intensity={40} color={APP} />
        <pointLight position={[-5, -3, 3]} intensity={30} color={DATA} />
        <Architecture overlay={overlay} />
        <Sparkles count={lite ? 25 : 60} scale={[16, 10, 8]} size={2} speed={0.25} color={AI} opacity={0.5} />
        {!lite && (
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={0.3} intensity={0.9} radius={0.6} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Labels only when the stack sits beside the copy; on narrow screens it's background art. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden [@media(min-aspect-ratio:23/20)]:block"
      >
        {LAYERS.map((l, i) => (
          <span
            key={l.name}
            ref={(el) => {
              overlay.current.layers[i] = el;
            }}
            style={{ ...hidden, color: l.color }}
            className="absolute top-0 left-0 pr-3 font-mono text-[10px] tracking-[0.25em] whitespace-nowrap opacity-70"
          >
            {l.name}
          </span>
        ))}
        {NODE_IDS.map((id, i) => (
          <span
            key={id}
            ref={(el) => {
              overlay.current.nodes[i] = el;
            }}
            data-active="false"
            style={hidden}
            className="absolute top-0 left-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-white/75 backdrop-blur-sm transition-colors duration-300 data-[active=true]:border-cyan/70 data-[active=true]:bg-cyan/15 data-[active=true]:text-white"
          >
            {NODES[id].name}
          </span>
        ))}
        <div
          ref={(el) => {
            overlay.current.caption = el;
          }}
          style={hidden}
          className="absolute top-0 left-0 flex items-center gap-2 rounded-full border border-white/15 bg-void/70 px-3.5 py-1.5 font-mono text-xs whitespace-nowrap text-ink backdrop-blur-md"
        >
          <span
            ref={(el) => {
              overlay.current.step = el;
            }}
            className="text-cyan"
          >
            01
          </span>
          <span
            ref={(el) => {
              overlay.current.text = el;
            }}
          >
            {HOPS[0].text}
          </span>
        </div>
      </div>
    </div>
  );
}
