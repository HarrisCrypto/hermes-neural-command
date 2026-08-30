"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Icosahedron, Sphere } from "@react-three/drei";
import * as THREE from "three";

const shellVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vViewDir;
  varying float vDisp;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float wave = sin(position.x * 5.4 + uTime * 1.7) * cos(position.y * 4.8 + uTime * 1.15);
    float ripple = sin(length(position.xy) * 8.0 - uTime * 2.4);
    float d = (wave * 0.045 + ripple * 0.02) * uIntensity;
    vec3 pos = position + normal * d;
    vDisp = d;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const shellFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vViewDir;
  varying float vDisp;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 vd = normalize(vViewDir);
    float fresnel = pow(1.0 - abs(dot(n, vd)), 2.6);
    float scan = sin(vWorld.y * 16.0 - uTime * 3.2) * 0.5 + 0.5;
    float hex = sin(vWorld.x * 13.0 + uTime * 0.4) * sin(vWorld.z * 13.0);
    vec3 gold = vec3(0.83, 0.69, 0.48);
    vec3 teal = vec3(0.24, 0.88, 0.78);
    vec3 ice = vec3(0.91, 0.93, 0.97);
    vec3 col = mix(gold, ice, fresnel);
    col = mix(col, teal, scan * 0.28);
    col += gold * max(hex, 0.0) * 0.12;
    col += vec3(0.15, 0.45, 0.7) * abs(vDisp) * 8.0;
    float alpha = 0.07 + fresnel * 0.78 * uIntensity + scan * 0.07;
    gl_FragColor = vec4(col, alpha);
  }
`;

const coreVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  uniform float uTime;
  uniform float uIntensity;
  void main() {
    vN = normal;
    float d = sin(position.y * 7.0 + uTime * 2.2) * 0.08 * uIntensity;
    vec3 pos = position + normal * d;
    vP = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const coreFragment = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  uniform float uTime;
  uniform float uIntensity;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), vec3(0.0, 0.0, 1.0))), 2.0);
    float pulse = 0.55 + 0.45 * sin(uTime * 2.4);
    vec3 col = mix(vec3(0.45, 0.32, 0.16), vec3(0.95, 0.9, 0.78), f * pulse);
    col = mix(col, vec3(0.24, 0.88, 0.78), 0.22 * uIntensity);
    gl_FragColor = vec4(col, 0.18 + f * 0.45 * uIntensity);
  }
`;

export function Core({ intensity }: { intensity: number }) {
  const shell = useRef<THREE.ShaderMaterial>(null);
  const inner = useRef<THREE.ShaderMaterial>(null);
  const heart = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    // created once; updated in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const innerUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (shell.current) {
      shell.current.uniforms.uTime.value = t;
      shell.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        shell.current.uniforms.uIntensity.value,
        intensity,
        0.08,
      );
    }
    if (inner.current) {
      inner.current.uniforms.uTime.value = t;
      inner.current.uniforms.uIntensity.value = intensity;
    }
    if (heart.current) {
      const s = 0.92 + Math.sin(t * 2.1) * 0.08 * intensity;
      heart.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={heart}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#d4af7a" transparent opacity={0.9} />
      </mesh>
      <Sphere args={[0.72, 48, 48]}>
        <shaderMaterial
          ref={inner}
          uniforms={innerUniforms}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      <Icosahedron args={[2.05, 4]}>
        <shaderMaterial
          ref={shell}
          uniforms={uniforms}
          vertexShader={shellVertex}
          fragmentShader={shellFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </Icosahedron>
      <Icosahedron args={[2.12, 1]}>
        <meshBasicMaterial
          color="#e8eef8"
          wireframe
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Icosahedron>
    </group>
  );
}
