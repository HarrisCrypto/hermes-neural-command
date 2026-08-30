"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NEURON_COLORS, buildSynapses, fibonacciSphere, hashed } from "@/components/brain/geometry";

const COUNT = 220;

export function Neurons({ intensity }: { intensity: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const points = useMemo(() => fibonacciSphere(COUNT, 2.08), []);
  const phases = useMemo(() => Float32Array.from({ length: COUNT }, (_, i) => hashed(i + 1) * Math.PI * 2), []);
  const speeds = useMemo(() => Float32Array.from({ length: COUNT }, (_, i) => 1.2 + hashed(i + 40) * 2.4), []);

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      c.setHex(NEURON_COLORS[i % NEURON_COLORS.length]);
      inst.setColorAt(i, c);
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const inst = mesh.current;
    if (!inst) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const pulse = 0.55 + Math.sin(t * speeds[i] + phases[i]) * 0.45;
      const s = (0.55 + pulse * 0.7 * intensity) * 0.055;
      dummy.position.copy(points[i]);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function Synapses({ intensity }: { intensity: number }) {
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const { geometry } = useMemo(() => {
    const pts = fibonacciSphere(120, 2.02);
    const pairs = buildSynapses(pts, 0.95, 160);
    const positions = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], i) => {
      positions[i * 6] = a.x;
      positions[i * 6 + 1] = a.y;
      positions[i * 6 + 2] = a.z;
      positions[i * 6 + 3] = b.x;
      positions[i * 6 + 4] = b.y;
      positions[i * 6 + 5] = b.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, pairs };
  }, []);

  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.opacity = 0.05 + Math.abs(Math.sin(clock.elapsedTime * 1.3)) * 0.18 * intensity;
    }
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={mat}
        color="#00f0ff"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

export function Pulses({ intensity }: { intensity: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const paths = useMemo(() => {
    const pts = fibonacciSphere(80, 2.0);
    const pairs = buildSynapses(pts, 1.15, 48);
    return pairs.map(([a, b], i) => ({
      a,
      b,
      phase: hashed(i + 90),
      speed: 0.18 + hashed(i + 140) * 0.35,
    }));
  }, []);

  useFrame(({ clock }) => {
    const inst = mesh.current;
    if (!inst) return;
    const t = clock.elapsedTime;
    paths.forEach((p, i) => {
      const u = (t * p.speed + p.phase) % 1;
      dummy.position.lerpVectors(p.a, p.b, u);
      dummy.scale.setScalar(0.028 + intensity * 0.02);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, paths.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#f8fdff" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}
