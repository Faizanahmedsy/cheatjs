"use client";

/**
 * 3D loss landscape: a bowl with a bump, and a ball running gradient descent
 * down it. The path is computed with real gradient steps, not drawn by hand.
 * Loaded lazily (next/dynamic, ssr:false) so three.js never ships with other pages.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Loss surface L(a, b): an elongated bowl (minimum at 0,0) plus a small bump to make the path curve. */
export const loss = (a: number, b: number) => 0.08 * a * a + 0.22 * b * b + 0.9 * Math.exp(-((a + 0.6) ** 2 + (b - 1.4) ** 2) / 0.8);

function grad(a: number, b: number): [number, number] {
  const h = 1e-4;
  return [(loss(a + h, b) - loss(a - h, b)) / (2 * h), (loss(a, b + h) - loss(a, b - h)) / (2 * h)];
}

/** Plain gradient descent from (3, 2.6) with learning rate 1.2 for 40 steps. */
export function descentPath(start: [number, number] = [3, 2.6], lr = 1.2, steps = 40) {
  const out: [number, number][] = [start];
  let [a, b] = start;
  for (let i = 0; i < steps; i++) {
    const [ga, gb] = grad(a, b);
    a -= lr * ga;
    b -= lr * gb;
    out.push([a, b]);
  }
  return out;
}

const SIZE = 8;
const LIFT = 0.04;

function Surface() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, 64, 64);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const lo = new THREE.Color("#1d4ed8");
    const hi = new THREE.Color("#f59e0b");
    for (let i = 0; i < pos.count; i++) {
      const a = pos.getX(i);
      const b = pos.getZ(i);
      const y = loss(a, b);
      pos.setY(i, y);
      const c = lo.clone().lerp(hi, Math.min(1, y / 3));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.88} roughness={0.7} />
      </mesh>
      <mesh geometry={geom}>
        <meshBasicMaterial wireframe color="#93c5fd" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function Ball({ path, still }: { path: THREE.Vector3[]; still: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const [trail, setTrail] = useState(1);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (still) {
      ref.current.position.copy(path[path.length - 1]);
      return;
    }
    // ~4 steps per second, then pause at the bottom and restart.
    t.current = (t.current + dt * 4) % (path.length + 8);
    const i = Math.min(path.length - 1, Math.floor(t.current));
    const k = Math.min(1, t.current - i);
    const a = path[i];
    const b = path[Math.min(path.length - 1, i + 1)];
    ref.current.position.lerpVectors(a, b, k);
    if (i + 1 !== trail) setTrail(i + 1);
  });
  const shown = still ? path : path.slice(0, Math.max(2, trail + 1));
  return (
    <group>
      <Line points={shown} color="#fbbf24" lineWidth={2} />
      <mesh ref={ref} position={path[0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function ThreeLoss() {
  const still = usePrefersReducedMotion();
  const path = useMemo(() => descentPath().map(([a, b]) => new THREE.Vector3(a, loss(a, b) + LIFT + 0.14, b)), []);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  if (!ok) return <div className="grid h-full place-items-center p-4 text-center text-xs text-lab-muted">WebGL is not available in this browser, so the 3D surface is skipped. The 2D loss curve in the other steps shows the same idea.</div>;
  const start = path[0];
  const end = path[path.length - 1];
  return (
    <Canvas camera={{ position: [7, 6, 8], fov: 42 }} dpr={[1, 1.75]} aria-label="3D loss landscape with a ball rolling downhill">
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 4]} intensity={1.1} />
      <Surface />
      <Ball path={path} still={still} />
      <Html position={[start.x, start.y + 0.5, start.z]} center>
        <span className="whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 font-labmono text-[10px] text-amber-200">start (random weights)</span>
      </Html>
      <Html position={[end.x, end.y - 0.55, end.z]} center>
        <span className="whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 font-labmono text-[10px] text-emerald-200">minimum</span>
      </Html>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={!still} autoRotateSpeed={0.6} />
    </Canvas>
  );
}
