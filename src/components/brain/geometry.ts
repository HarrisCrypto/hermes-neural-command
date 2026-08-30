import * as THREE from "three";

export function hashed(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function fibonacciSphere(count: number, radius: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

export function buildSynapses(points: THREE.Vector3[], maxDist: number, maxLinks: number) {
  const pairs: Array<[THREE.Vector3, THREE.Vector3]> = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < maxDist && hashed(i * 97 + j) > 0.55) {
        pairs.push([points[i], points[j]]);
        if (pairs.length >= maxLinks) return pairs;
      }
    }
  }
  return pairs;
}

export const NEURON_COLORS = [0x00f0ff, 0xa855f7, 0xec4899, 0x22d3ee, 0xfbbf24, 0x34d399];
