"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import type { Agent } from "@/lib/types";

function OrbitAgent({
  agent,
  index,
  total,
  selected,
  hovered,
  onHover,
  onSelect,
}: {
  agent: Agent;
  index: number;
  total: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const radius = 3.35 + (index % 3) * 0.42;
  const speed = 0.16 + index * 0.028;
  const tilt = ((index * 0.7) % 1) * 0.9 - 0.45;
  const phase = (index / Math.max(1, total)) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const a = t * speed + phase;
    group.current.position.set(
      Math.cos(a) * radius,
      Math.sin(a) * radius * Math.cos(tilt),
      Math.sin(a) * radius * Math.sin(tilt) * 0.55,
    );
    if (glow.current) {
      const pulse = 0.7 + Math.sin(t * 3 + index) * 0.3;
      const s = (selected || hovered ? 1.35 : 1) * (0.9 + pulse * 0.2);
      glow.current.scale.setScalar(s);
    }
  });

  const size = 0.11 + agent.load * 0.0009;

  return (
    <Trail width={selected ? 0.55 : 0.28} length={7} color={agent.color} attenuation={(w) => w * w} decay={1.4}>
      <group ref={group}>
        <mesh
          ref={glow}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(agent.id);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(agent.id);
          }}
        >
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={agent.color} transparent opacity={0.95} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.7, size * 2.3, 32]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={selected ? 0.7 : 0.28}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Trail>
  );
}

export function AgentConstellation({
  agents,
  focusId,
  hoverId,
  onHover,
  onSelect,
}: {
  agents: Agent[];
  focusId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const list = useMemo(() => agents.slice(0, 8), [agents]);
  return (
    <group>
      {list.map((agent, i) => (
        <OrbitAgent
          key={agent.id}
          agent={agent}
          index={i}
          total={list.length}
          selected={focusId === agent.id}
          hovered={hoverId === agent.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
