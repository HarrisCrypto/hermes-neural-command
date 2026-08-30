"use client";

import { Canvas } from "@react-three/fiber";
import { NeuralScene } from "@/components/brain/NeuralScene";
import { useHermes } from "@/lib/store";

export function BrainCanvas() {
  const { setFocusAgentId, selectSession } = useHermes();
  return (
    <Canvas
      camera={{ position: [0, 0.55, 7.1], fov: 52, near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        setFocusAgentId(null);
        selectSession(null);
      }}
    >
      <NeuralScene />
    </Canvas>
  );
}
