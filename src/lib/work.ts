import { isInventedProject, mergeBoard } from "@/lib/board";
import type { HermesData, Project } from "@/lib/types";

const METRIC = /^(tool use|reasoning|memory|output|reflection|proactive|cognitive|core|region)$/i;

export function workNodes(data: HermesData): Project[] {
  return mergeBoard(data.projects).filter(
    (p) => p.name && !METRIC.test(p.name.trim()) && !isInventedProject(p.name),
  );
}
