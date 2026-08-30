"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function TickRing({
  radius,
  count,
  color,
  speed,
  tilt,
}: {
  radius: number;
  count: number;
  color: string;
  speed: number;
  tilt: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const ticks = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += speed * dt;
    const inst = ticks.current;
    if (!inst || inst.userData.ready) return;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const long = i % 6 === 0;
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      dummy.rotation.set(0, 0, a);
      dummy.scale.set(long ? 1.8 : 1, 1, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.userData.ready = true;
  });

  return (
    <group ref={group} rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <instancedMesh ref={ticks} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.09, 0.01, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

export function HudRings() {
  const extras = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (extras.current) {
      extras.current.rotation.y += dt * 0.08;
      extras.current.rotation.x += dt * 0.03;
    }
  });

  return (
    <group>
      <TickRing radius={3.15} count={72} color="#00f0ff" speed={0.12} tilt={[Math.PI / 2.15, 0.15, 0]} />
      <TickRing radius={3.55} count={56} color="#a855f7" speed={-0.08} tilt={[1.2, 0.6, 0.2]} />
      <TickRing radius={3.95} count={48} color="#ec4899" speed={0.05} tilt={[0.4, 1.1, 0.3]} />
      <group ref={extras}>
        <mesh rotation={[0.9, 0.2, 0.4]}>
          <torusGeometry args={[4.4, 0.008, 8, 160]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh rotation={[1.4, 0.8, 0.1]}>
          <torusGeometry args={[4.75, 0.006, 8, 160]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export function ScanWave({ pulse, intensity }: { pulse: number; intensity: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const start = useRef(0);
  const last = useRef(pulse);

  useFrame(({ clock }) => {
    if (pulse !== last.current) {
      last.current = pulse;
      start.current = clock.elapsedTime;
    }
    const age = clock.elapsedTime - start.current;
    const active = age < 1.6;
    if (!ring.current) return;
    const t = active ? age / 1.6 : 1;
    const s = 0.4 + t * 5.2;
    ring.current.scale.set(s, s, s);
    const mat = ring.current.material as THREE.MeshBasicMaterial;
    mat.opacity = active ? (1 - t) * 0.35 * intensity : 0;
  });

  return (
    <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.92, 1.02, 64]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}
