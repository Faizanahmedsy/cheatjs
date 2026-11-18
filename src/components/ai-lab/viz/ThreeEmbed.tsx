"use client";

/**
 * 3D embedding space: three clusters of words that rotate slowly, plus a query
 * point joined to its nearest neighbours. Positions are a toy 3D projection —
 * real embeddings have hundreds of dimensions. Lazy-loaded with next/dynamic.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { gaussian, seeded } from "../engine/math";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const CLUSTERS = [
  { name: "animals", color: "#34d399", centre: [-2.2, 0.6, -0.8], words: ["cat", "dog", "kitten", "puppy", "lion", "tiger"] },
  { name: "vehicles", color: "#60a5fa", centre: [2.2, 0.2, -0.6], words: ["car", "truck", "bus", "bike", "train", "van"] },
  { name: "food", color: "#fbbf24", centre: [0.1, -0.6, 2.2], words: ["pizza", "pasta", "bread", "rice", "soup", "salad"] },
] as const;

export function embeddingPoints() {
  const rand = seeded(42);
  return CLUSTERS.flatMap((c) =>
    c.words.map((w) => ({
      word: w,
      cluster: c.name,
      color: c.color,
      pos: new THREE.Vector3(c.centre[0] + gaussian(rand) * 0.55, c.centre[1] + gaussian(rand) * 0.55, c.centre[2] + gaussian(rand) * 0.55),
    })),
  );
}

function Cloud({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(embeddingPoints, []);
  const query = useMemo(() => new THREE.Vector3(-1.7, 0.9, -0.2), []);
  const nearest = useMemo(
    () =>
      [...points]
        .sort((a, b) => a.pos.distanceTo(query) - b.pos.distanceTo(query))
        .slice(0, 3),
    [points, query],
  );
  useFrame((_, dt) => {
    if (!still && group.current) group.current.rotation.y += dt * 0.15;
  });
  return (
    <group ref={group}>
      {points.map((p) => (
        <group key={p.word} position={p.pos}>
          <mesh>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.35} />
          </mesh>
          <Html center position={[0, 0.28, 0]} style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap font-labmono text-[10px]" style={{ color: p.color }}>
              {p.word}
            </span>
          </Html>
        </group>
      ))}
      <mesh position={query}>
        <octahedronGeometry args={[0.18]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.6} />
      </mesh>
      <Html center position={[query.x, query.y + 0.38, query.z]} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded bg-black/60 px-1 font-labmono text-[10px] text-pink-300">query: “a small cat”</span>
      </Html>
      {nearest.map((n) => (
        <Line key={n.word} points={[query, n.pos]} color="#f472b6" lineWidth={1.2} dashed dashSize={0.12} gapSize={0.08} />
      ))}
      {/* axes, so it reads as a space */}
      <Line points={[[-3.5, -1.8, 0], [3.5, -1.8, 0]]} color="#475569" lineWidth={1} />
      <Line points={[[0, -1.8, -3.5], [0, -1.8, 3.5]]} color="#475569" lineWidth={1} />
      <Line points={[[0, -1.8, 0], [0, 2.6, 0]]} color="#475569" lineWidth={1} />
    </group>
  );
}

export default function ThreeEmbed() {
  const still = usePrefersReducedMotion();
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  if (!ok) return <div className="grid h-full place-items-center p-4 text-center text-xs text-lab-muted">WebGL is not available, so the 3D view is skipped. The 2D map in the other steps shows the same clusters.</div>;
  return (
    <Canvas camera={{ position: [0, 2.2, 8], fov: 45 }} dpr={[1, 1.75]} aria-label="3D embedding space with word clusters">
      <ambientLight intensity={0.8} />
      <pointLight position={[5, 6, 5]} intensity={40} />
      <Cloud still={still} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
