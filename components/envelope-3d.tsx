"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";

/* ─── Types ─────────────────────────────────────────────── */
interface EnvelopeSceneProps {
  phase: "idle" | "opening" | "opened";
  onOpened: () => void;
}

/* ─── Helpers ───────────────────────────────────────────── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ─── Envelope Scene ─────────────────────────────────────── */
function EnvelopeScene({ phase, onOpened }: EnvelopeSceneProps) {
  const envelopeRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Mesh>(null);
  const letterRef = useRef<THREE.Mesh>(null);
  const floatT = useRef(0);
  const openProgress = useRef(0);
  const hasTriggeredOpened = useRef(false);

  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 7);
  }, [camera]);

  // Build geometries once
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(3.2, 2.2, 0.04), []);
  
  const flapGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.6;
    shape.moveTo(-w, 0);
    shape.lineTo(0, 1.35);
    shape.lineTo(w, 0);
    shape.lineTo(-w, 0);
    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, []);

  // Materials
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e8a4b8"),
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  }), []);
  
  const flapMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c87a94"),
    roughness: 0.6,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), []);

  const letterMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#fff9f8"),
    roughness: 0.85,
    metalness: 0,
    side: THREE.DoubleSide,
  }), []);

  const creaseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c87a94"),
    roughness: 0.5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  }), []);

  // Crease shapes
  const bottomCreaseGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, -1.1);
    s.lineTo(0, 0);
    s.lineTo(1.6, -1.1);
    return new THREE.ShapeGeometry(s);
  }, []);

  const leftCreaseGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, -1.1);
    s.lineTo(0, 0);
    s.lineTo(-1.6, 1.1);
    s.lineTo(-1.6, -1.1);
    return new THREE.ShapeGeometry(s);
  }, []);

  const rightCreaseGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(1.6, -1.1);
    s.lineTo(0, 0);
    s.lineTo(1.6, 1.1);
    s.lineTo(1.6, -1.1);
    return new THREE.ShapeGeometry(s);
  }, []);

  useFrame((_, delta) => {
    floatT.current += delta;
    const env = envelopeRef.current;
    const flap = flapRef.current;
    const letter = letterRef.current;
    if (!env || !flap || !letter) return;

    if (phase === "idle") {
      env.rotation.y = Math.sin(floatT.current * 0.5) * 0.12;
      env.rotation.x = Math.sin(floatT.current * 0.3) * 0.05;
      env.position.y = Math.sin(floatT.current * 0.7) * 0.08;
    }

    if (phase === "opening" || phase === "opened") {
      openProgress.current = Math.min(1, openProgress.current + delta * 1.2);
      const t = openProgress.current;
      const ease = 1 - Math.pow(1 - t, 3);

      // Flap opens (rotates around its bottom edge = top of envelope body)
      flap.rotation.x = lerp(0, -Math.PI * 0.9, ease);

      // Letter rises
      letter.position.y = lerp(-0.45, 2.0, ease);

      // Envelope settles
      env.rotation.x = lerp(env.rotation.x, -0.12, delta * 3);
      env.rotation.y = lerp(env.rotation.y, 0, delta * 4);
      env.position.y = lerp(env.position.y, 0, delta * 3);

      if (ease > 0.97 && !hasTriggeredOpened.current) {
        hasTriggeredOpened.current = true;
        onOpened();
      }
    }
  });

  return (
    <group ref={envelopeRef}>
      {/* Lighting */}
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 5]} intensity={1.6} castShadow />
      <directionalLight position={[-4, -2, 3]} intensity={0.7} color="#ffd6e5" />
      <pointLight position={[0, 3, 4]} intensity={1.1} color="#ffb3cc" />

      {/* Envelope body */}
      <mesh geometry={bodyGeo} material={bodyMat} castShadow receiveShadow />

      {/* Front crease decorations */}
      <mesh geometry={bottomCreaseGeo} material={creaseMat} position={[0, -1.1, 0.023]} />
      <mesh geometry={leftCreaseGeo} material={creaseMat} position={[0, 0, 0.023]} />
      <mesh geometry={rightCreaseGeo} material={creaseMat} position={[0, 0, 0.023]} />

      {/* Flap — pivot point is y=1.1 (top of body) */}
      <group position={[0, 1.1, 0.023]}>
        <mesh ref={flapRef} geometry={flapGeo} material={flapMat} />
      </group>

      {/* Letter card */}
      <mesh ref={letterRef} position={[0, -0.45, 0.026]} material={letterMat} castShadow>
        <planeGeometry args={[2.6, 1.9]} />
      </mesh>

      {/* Letter text lines */}
      {[0.35, 0.12, -0.1, -0.33].map((y, i) => (
        <mesh key={i} position={[0.0, -0.45 + y, 0.028]}>
          <planeGeometry args={[1.9, 0.025]} />
          <meshStandardMaterial color="#f0b0c8" roughness={1} />
        </mesh>
      ))}

      {/* Small wax seal dot on letter */}
      <mesh position={[0, -0.45, 0.028]}>
        <circleGeometry args={[0.16, 32]} />
        <meshStandardMaterial color="#d4487a" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* ─── Floating Particles ─────────────────────────────────── */
function Particles({ active }: { active: boolean }) {
  const count = 80;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  }, []);
  const speeds = useMemo(() => Array.from({ length: count }, () => Math.random() * 0.4 + 0.15), []);

  useFrame((_, delta) => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.setY(i, pos.getY(i) + speeds[i] * delta * 0.55);
      if (pos.getY(i) > 5) pos.setY(i, -5);
    }
    pos.needsUpdate = true;
    ref.current.rotation.z += delta * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffb3cc" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Main Exported Component ─────────────────────────────── */
interface Envelope3DProps {
  onOpened: () => void;
  className?: string;
}

export function Envelope3D({ onOpened, className = "" }: Envelope3DProps) {
  const [phase, setPhase] = useState<"idle" | "opening" | "opened">("idle");
  const [particles, setParticles] = useState(false);

  function handleClick() {
    if (phase !== "idle") return;
    setPhase("opening");
    setParticles(true);
  }

  function handleOpened() {
    setPhase("opened");
    setTimeout(() => onOpened(), 350);
  }

  return (
    <div
      className={`envelope-3d-wrap ${className} ${phase !== "idle" ? "is-opening" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Klik untuk membuka amplop undangan"
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <EnvelopeScene phase={phase} onOpened={handleOpened} />
        <Particles active={particles} />
      </Canvas>

      {phase === "idle" && (
        <div className="envelope-hint" aria-hidden="true">
          <span className="envelope-hint-text">ketuk untuk membuka</span>
          <span className="envelope-hint-pulse" />
        </div>
      )}
    </div>
  );
}
