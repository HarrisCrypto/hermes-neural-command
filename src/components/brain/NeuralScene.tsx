"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Core } from "@/components/brain/Core";
import { Neurons, Pulses, Synapses } from "@/components/brain/Neurons";
import { AgentConstellation } from "@/components/brain/Agents";
import { HudRings, ScanWave } from "@/components/brain/Rings";
import { useHermes } from "@/lib/store";

function Lights({ intensity }: { intensity: number }) {
  const a = useRef<THREE.PointLight>(null);
  const b = useRef<THREE.PointLight>(null);
  const c = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) {
      a.current.position.set(Math.cos(t * 0.7) * 4, Math.sin(t * 0.5) * 2, Math.sin(t * 0.7) * 4 + 2);
      a.current.intensity = (1.6 + Math.sin(t * 1.5) * 0.7) * intensity;
    }
    if (b.current) {
      b.current.position.set(Math.sin(t * 0.6) * 3, Math.cos(t * 0.4) * 3, Math.cos(t * 0.6) * 3 + 1);
      b.current.intensity = (1.2 + Math.sin(t * 1.1) * 0.5) * intensity;
    }
    if (c.current) {
      c.current.position.set(Math.cos(t * 0.8) * 2, 3 + Math.sin(t * 1.2), Math.sin(t * 0.8) * 3);
      c.current.intensity = (0.9 + Math.sin(t * 2) * 0.4) * intensity;
    }
  });
  return (
    <>
      <ambientLight intensity={0.28} color="#b8c4d8" />
      <pointLight ref={a} color="#d4af7a" distance={28} />
      <pointLight ref={b} color="#3ee0c8" distance={26} />
      <pointLight ref={c} color="#e8eef8" distance={22} />
    </>
  );
}

function FpsProbe() {
  const { setFps } = useHermes();
  const frames = useRef(0);
  const last = useRef(0);
  useFrame(() => {
    frames.current += 1;
    const now = performance.now();
    if (now - last.current >= 1000) {
      setFps(frames.current);
      frames.current = 0;
      last.current = now;
    }
  });
  return null;
}

function CameraRig() {
  const { focusAgentId, data } = useHermes();
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!focusAgentId) {
      target.current.set(0, 0, 0);
    }
  }, [focusAgentId]);

  useFrame(() => {
    if (focusAgentId) {
      const idx = data.agents.findIndex((a) => a.id === focusAgentId);
      if (idx >= 0) {
        const radius = 3.35 + (idx % 3) * 0.42;
        target.current.lerp(new THREE.Vector3(radius * 0.35, 0.2, 0), 0.04);
      }
    } else {
      target.current.lerp(new THREE.Vector3(0, 0, 0), 0.03);
    }
    camera.lookAt(target.current);
  });
  return null;
}

export function NeuralScene() {
  const {
    data,
    thinking,
    boosted,
    pulse,
    focusAgentId,
    hoverAgentId,
    setHoverAgentId,
    setFocusAgentId,
    selectSession,
    listening,
    voiceLevel,
  } = useHermes();
  const intensity =
    0.35 +
    (data.cognitiveLoad / 100) * 0.55 +
    (thinking ? 0.22 : 0) +
    (boosted ? 0.12 : 0) +
    (listening ? 0.28 : 0) +
    voiceLevel * 0.85;
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y += 0.0012;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.28) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#07060a"]} />
      <fog attach="fog" args={["#07060a", 10, 26]} />
      <Lights intensity={intensity} />
      <group ref={group}>
        <Core intensity={intensity} />
        <Neurons intensity={intensity} />
        <Synapses intensity={intensity} />
        <Pulses intensity={intensity} />
      </group>
      <HudRings />
      <ScanWave pulse={pulse} intensity={intensity} />
      <AgentConstellation
        agents={data.agents}
        focusId={focusAgentId}
        hoverId={hoverAgentId}
        onHover={setHoverAgentId}
        onSelect={(id) => {
          setFocusAgentId(id);
          const session = data.sessions.find((s) => s.agentId === id);
          selectSession(session?.id ?? null);
        }}
      />
      <Sparkles count={120} scale={7} size={2.4} speed={listening ? 0.9 : 0.35} opacity={0.6} color="#d4af7a" />
      <Stars radius={48} depth={28} count={1400} factor={3.2} saturation={0} fade speed={0.55} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.4}
        maxDistance={14}
        autoRotate={!focusAgentId && !listening}
        autoRotateSpeed={listening ? 1.6 : thinking ? 1.1 : 0.35}
      />
      <CameraRig />
      <FpsProbe />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={listening ? 1.85 : thinking ? 1.45 : 1.05}
          luminanceThreshold={0.16}
          luminanceSmoothing={0.32}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.22} darkness={0.78} />
      </EffectComposer>
    </>
  );
}
