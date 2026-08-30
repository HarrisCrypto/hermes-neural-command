import type { HermesData, Project, Session } from "@/lib/types";

const METRIC = /^(tool use|reasoning|memory|output|reflection|proactive|cognitive|core|region)$/i;

export function projectsFromSessions(sessions: Session[]): Project[] {
  const seen = new Set<string>();
  const out: Project[] = [];
  for (const s of sessions) {
    const name = s.title;
    const key = name.toLowerCase();
    if (!name || seen.has(key) || METRIC.test(name.trim())) continue;
    seen.add(key);
    out.push({
      id: s.id,
      name,
      category: s.source || "Session",
      description: `${s.active ? "Live" : "Idle"} session on ${s.model}.`,
      progress: s.active ? 62 : 28,
      icon: "◈",
      updated: "live",
    });
  }
  return out;
}

export function workNodes(data: HermesData): Project[] {
  const list = data.projects.length ? data.projects : projectsFromSessions(data.sessions);
  return list.filter((p) => p.name && !METRIC.test(p.name.trim())).slice(0, 10);
}
