"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float waveA = sin((pos.x * 2.8) + (uTime * .38) + uPointer.x) * .055;
    float waveB = cos((pos.y * 4.2) - (uTime * .28) + uPointer.y) * .035;
    pos.z += waveA + waveB;
    vWave = waveA + waveB;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uAccent;
  uniform float uOpened;
  varying vec2 vUv;
  varying float vWave;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float fold = sin((uv.x * 11.0) + (uTime * .48)) * .5 + .5;
    float fineFold = sin((uv.x * 33.0) - (uTime * .22)) * .5 + .5;
    float ribbon = smoothstep(.24, .02, abs(uv.y - .52 - sin(uv.x * 4.0 + uTime * .18) * .07));
    float shimmer = pow(max(0.0, 1.0 - abs(fold - .72) * 3.1), 4.0);
    float grain = hash(floor(uv * 330.0) + floor(uTime * 2.0)) * .035;
    vec3 pale = vec3(1.0, .78, .88);
    vec3 deep = mix(vec3(.42, .05, .20), uAccent, .62);
    vec3 color = mix(pale, deep, fold * .62 + fineFold * .08);
    color += shimmer * vec3(1.0, .88, .95);
    color += ribbon * vec3(.24, .03, .12) * .3;
    color += grain + vWave * .7;
    float edge = smoothstep(.0, .14, uv.x) * smoothstep(1.0, .86, uv.x);
    float alpha = mix(.50, .24, uOpened) * edge;
    gl_FragColor = vec4(color, alpha);
  }
`;

function SatinPlane({ accent, opened }: { accent: string; opened: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: new THREE.Color("#ff8fbd") },
      uOpened: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    material.current?.uniforms.uAccent.value.set(accent);
  }, [accent]);

  useEffect(() => {
    if (material.current) material.current.uniforms.uOpened.value = opened ? 1 : 0;
  }, [opened]);

  useFrame((state, delta) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value += Math.min(delta, .05);
    material.current.uniforms.uPointer.value.lerp(pointer, .045);
    material.current.uniforms.uOpened.value = THREE.MathUtils.lerp(
      material.current.uniforms.uOpened.value,
      opened ? 1 : 0,
      .055,
    );
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 48, 48]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function SatinCanvas({
  accent,
  opened,
  active,
}: {
  accent: string;
  opened: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 1.2], fov: 45 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <SatinPlane accent={accent} opened={opened} />
    </Canvas>
  );
}
