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
      <ambientLight intensity={0.22} color="#123046" />
      <pointLight ref={a} color="#00f0ff" distance={28} />
      <pointLight ref={b} color="#a855f7" distance={26} />
      <pointLight ref={c} color="#ec4899" distance={22} />
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
  const { data, thinking, boosted, pulse, focusAgentId, hoverAgentId, setHoverAgentId, setFocusAgentId, selectSession } =
    useHermes();
  const intensity = 0.35 + (data.cognitiveLoad / 100) * 0.55 + (thinking ? 0.22 : 0) + (boosted ? 0.12 : 0);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y += 0.0012;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.28) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#020308"]} />
      <fog attach="fog" args={["#020308", 10, 26]} />
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
      <Sparkles count={90} scale={7} size={2.2} speed={0.35} opacity={0.55} color="#7ef6ff" />
      <Stars radius={48} depth={28} count={1400} factor={3.2} saturation={0} fade speed={0.55} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.4}
        maxDistance={14}
        autoRotate={!focusAgentId}
        autoRotateSpeed={thinking ? 1.1 : 0.35}
      />
      <CameraRig />
      <FpsProbe />
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={thinking ? 1.55 : 1.15} luminanceThreshold={0.18} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.72} />
      </EffectComposer>
    </>
  );
}
