"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Project } from "@/lib/types";

const GOLD = "#d4af7a";
const TEAL = "#3ee0c8";
const ICE = "#e8eef8";

function BoltLine({
  geometry,
  index,
  mats,
}: {
  geometry: THREE.BufferGeometry;
  index: number;
  mats: MutableRefObject<Array<THREE.LineBasicMaterial | null>>;
}) {
  const object = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: ICE,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    mats.current[index] = mat;
    return new THREE.Line(geometry, mat);
  }, [geometry, index, mats]);
  return <primitive object={object} />;
}

function makePairs(n: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  const seen = new Set<string>();
  const add = (i: number, j: number) => {
    if (i === j) return;
    const key = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push([i, j]);
  };
  for (let i = 0; i < n; i++) {
    add(i, (i + 1) % n);
    if (n > 3) add(i, (i + 2) % n);
    add(i, -1);
  }
  return pairs;
}

function Nodule({
  project,
  index,
  focused,
  hovered,
  onHover,
  onSelect,
  nodeRef,
}: {
  project: Project;
  index: number;
  focused: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  nodeRef: (el: THREE.Group | null) => void;
}) {
  const glow = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const pointerDown = useRef<{ x: number; y: number } | null>(null);
  const color = index % 2 === 0 ? GOLD : TEAL;
  const size = 0.095 + project.progress * 0.00035;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const beat = 0.86 + Math.sin(t * 2.8 + index) * 0.16 + (focused || hovered ? 0.2 : 0);
    if (glow.current) glow.current.scale.setScalar((focused ? 1.55 : hovered ? 1.25 : 1) * beat);
    if (halo.current) {
      const mat = halo.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (focused ? 0.42 : 0.18) + Math.sin(t * 2.2 + index) * 0.1;
      halo.current.scale.setScalar(1 + Math.sin(t * 2.4 + index) * 0.12 + (focused ? 0.35 : 0));
    }
    if (ring.current) {
      ring.current.rotation.z += 0.025 + (focused ? 0.05 : 0);
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (focused ? 0.85 : 0.42) + Math.sin(t * 2 + index) * 0.12;
    }
  });

  return (
    <group ref={nodeRef}>
      <mesh ref={glow}>
        <sphereGeometry args={[size, 22, 22]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[size * 1.9, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.55, size * 2.05, 36]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(project.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          pointerDown.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          const start = pointerDown.current;
          pointerDown.current = null;
          if (!start) return;
          const dx = e.nativeEvent.clientX - start.x;
          const dy = e.nativeEvent.clientY - start.y;
          if (dx * dx + dy * dy < 100) onSelect(project.id);
        }}
      >
        <sphereGeometry args={[0.36, 10, 10]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ProjectConstellation({
  projects,
  focusId,
  hoverId,
  voiceLevel,
  onHover,
  onSelect,
}: {
  projects: Project[];
  focusId: string | null;
  hoverId: string | null;
  voiceLevel: number;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const list = useMemo(() => projects.slice(0, 8), [projects]);
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<Array<THREE.Group | null>>([]);
  const synMat = useRef<THREE.LineBasicMaterial>(null);
  const boltMats = useRef<Array<THREE.LineBasicMaterial | null>>([null, null, null]);
  const spin = useRef(0);
  const lastFocus = useRef<string | null>(null);
  const bolts = useRef([
    { life: 0, i: 0, j: 1 },
    { life: 0, i: 0, j: 1 },
    { life: 0, i: 0, j: 1 },
  ]);

  const web = useMemo(() => {
    const pairs = makePairs(list.length);
    const synPos = new Float32Array(Math.max(pairs.length, 1) * 6);
    const synGeo = new THREE.BufferGeometry();
    synGeo.setAttribute("position", new THREE.BufferAttribute(synPos, 3));
    const sparkCount = Math.min(18, Math.max(6, pairs.length * 2));
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparks = Array.from({ length: sparkCount }, (_, i) => ({
      pair: i % Math.max(pairs.length, 1),
      u: Math.random(),
      speed: 0.35 + (i % 5) * 0.12,
    }));
    const boltPos = [0, 1, 2].map(() => new Float32Array(7 * 3));
    const boltGeo = boltPos.map((pos) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return geo;
    });
    return { pairs, synPos, synGeo, sparkPos, sparkGeo, sparks, boltPos, boltGeo };
  }, [list]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const v = voiceLevel;
    if (focusId !== lastFocus.current) {
      lastFocus.current = focusId;
      if (focusId) spin.current = 1;
    }

    if (group.current) {
      if (focusId && spin.current > 0) {
        let dy = 0 - group.current.rotation.y;
        while (dy > Math.PI) dy -= Math.PI * 2;
        while (dy < -Math.PI) dy += Math.PI * 2;
        group.current.rotation.y += dy * 0.09;
        group.current.rotation.x += (0.06 - group.current.rotation.x) * 0.07;
        spin.current *= 0.965;
        if (Math.abs(dy) < 0.035 && spin.current < 0.08) spin.current = 0;
      } else if (!focusId) {
        group.current.rotation.y += 0.0012;
        group.current.rotation.x = Math.sin(t * 0.28) * 0.05;
      }
    }

    list.forEach((project, i) => {
      const mesh = nodes.current[i];
      if (!mesh) return;
      const r = 2.08 + (i % 3) * 0.2;
      const y = Math.sin(i * 1.7) * 0.58;
      const focused = focusId === project.id;
      if (focused) {
        mesh.position.x += (0 - mesh.position.x) * 0.1;
        mesh.position.y += (y - mesh.position.y) * 0.1;
        mesh.position.z += (r - mesh.position.z) * 0.1;
        mesh.scale.setScalar(1.62);
      } else {
        const ang = t * 0.22 + (i / Math.max(list.length, 1)) * Math.PI * 2;
        mesh.position.set(Math.cos(ang) * r, y + Math.sin(t * 0.8 + i) * 0.08, Math.sin(ang) * r);
        mesh.scale.setScalar(1);
      }
    });

    const pointOf = (idx: number) => {
      if (idx < 0) return new THREE.Vector3(0, 0, 0);
      return nodes.current[idx]?.position ?? new THREE.Vector3();
    };

    if (web.pairs.length) {
      web.pairs.forEach((pair, i) => {
        const A = pointOf(pair[0]);
        const B = pointOf(pair[1]);
        web.synPos[i * 6] = A.x;
        web.synPos[i * 6 + 1] = A.y;
        web.synPos[i * 6 + 2] = A.z;
        web.synPos[i * 6 + 3] = B.x;
        web.synPos[i * 6 + 4] = B.y;
        web.synPos[i * 6 + 5] = B.z;
      });
      const syn = web.synGeo.getAttribute("position");
      if (syn) syn.needsUpdate = true;
      if (synMat.current) {
        synMat.current.opacity = 0.14 + Math.abs(Math.sin(t * 1.7)) * 0.2 + v * 0.18 + (spin.current ? 0.12 : 0);
      }
    }

    web.sparks.forEach((s, i) => {
      if (!web.pairs.length) return;
      s.u = (s.u + s.speed * delta) % 1;
      const pair = web.pairs[s.pair % web.pairs.length];
      const A = pointOf(pair[0]);
      const B = pointOf(pair[1]);
      web.sparkPos[i * 3] = A.x + (B.x - A.x) * s.u;
      web.sparkPos[i * 3 + 1] = A.y + (B.y - A.y) * s.u;
      web.sparkPos[i * 3 + 2] = A.z + (B.z - A.z) * s.u;
    });
    const spark = web.sparkGeo.getAttribute("position");
    if (spark) spark.needsUpdate = true;

    bolts.current.forEach((b, bi) => {
      const mat = boltMats.current[bi];
      if (!mat) return;
      b.life -= delta;
      if (b.life <= 0) {
        const chance = 0.018 + v * 0.05 + (spin.current ? 0.1 : 0);
        if (list.length > 1 && Math.random() < chance) {
          b.life = 0.1 + Math.random() * 0.16;
          b.i = Math.floor(Math.random() * list.length);
          b.j = (b.i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
        } else {
          mat.opacity = 0;
          return;
        }
      }
      const A = pointOf(b.i);
      const B = pointOf(b.j);
      const pos = web.boltPos[bi];
      for (let k = 0; k < 7; k++) {
        const u = k / 6;
        const jag = k > 0 && k < 6 ? (Math.random() - 0.5) * 0.2 : 0;
        pos[k * 3] = A.x + (B.x - A.x) * u + jag;
        pos[k * 3 + 1] = A.y + (B.y - A.y) * u + jag;
        pos[k * 3 + 2] = A.z + (B.z - A.z) * u + jag;
      }
      const attr = web.boltGeo[bi].getAttribute("position");
      if (attr) attr.needsUpdate = true;
      mat.opacity = Math.min(0.95, b.life * 6);
    });
  });

  if (!list.length) return null;

  return (
    <group ref={group}>
      {list.map((project, i) => (
        <Nodule
          key={project.id}
          project={project}
          index={i}
          focused={focusId === project.id}
          hovered={hoverId === project.id}
          onHover={onHover}
          onSelect={onSelect}
          nodeRef={(el) => {
            nodes.current[i] = el;
          }}
        />
      ))}
      <lineSegments geometry={web.synGeo}>
        <lineBasicMaterial
          ref={synMat}
          color={TEAL}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={web.sparkGeo}>
        <pointsMaterial
          color={ICE}
          size={0.07}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {web.boltGeo.map((geo, i) => (
        <BoltLine key={`bolt-${i}`} geometry={geo} index={i} mats={boltMats} />
      ))}
    </group>
  );
}

export function AgentConstellation(props: {
  agents: { id: string; name: string; role: string; status: string; load: number; color: string }[];
  focusId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const projects: Project[] = props.agents.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.role,
    description: a.status,
    progress: a.load,
    icon: "◈",
    updated: "live",
  }));
  return (
    <ProjectConstellation
      projects={projects}
      focusId={props.focusId}
      hoverId={props.hoverId}
      voiceLevel={0}
      onHover={props.onHover}
      onSelect={props.onSelect}
    />
  );
}
