import { AGENTS } from "@/lib/simulation";
import { clamp, uid } from "@/lib/format";
import type { RawActivity, RawAgent, RawDashboard, RawDeliverables, RawSession } from "@/lib/protocol";
import type { Agent, AgentStatus, HermesData, Project, Session } from "@/lib/types";

const PALETTE = ["#00f0ff", "#a855f7", "#ec4899", "#22d3ee", "#fbbf24", "#34d399", "#fb7185", "#38bdf8"];

function statusFrom(raw?: string, load = 0): AgentStatus {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("think")) return "thinking";
  if (s.includes("active") || s.includes("live") || s.includes("run")) return "active";
  if (s.includes("stand")) return "standby";
  if (s.includes("idle")) return "idle";
  if (load > 70) return "thinking";
  if (load > 40) return "active";
  if (load > 18) return "idle";
  return "standby";
}

function sessionId(s: RawSession, i: number) {
  return String(s.session_id ?? s.id ?? `ses-${i}`);
}

function adaptSession(s: RawSession, i: number): Session {
  const id = sessionId(s, i);
  return {
    id,
    title: s.title || s.name || `Session ${id}`,
    model: s.model || "hermes-core-15",
    source: s.source || "agent",
    toolCalls: s.tool_calls ?? 0,
    messages: s.messages ?? 0,
    cost: s.cost ?? 0,
    inputTokens: s.input_tokens ?? 0,
    outputTokens: s.output_tokens ?? 0,
    active: s.active !== false && !s.archived,
    startedAt: Date.now() - i * 60_000,
    agentId: slugAgent(s.model || s.source || id),
  };
}

function slugAgent(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "hermes";
}

function adaptAgent(raw: RawAgent, i: number): Agent {
  const name = (raw.name || `AGENT-${i + 1}`).toUpperCase();
  const load = clamp(raw.load ?? 40, 0, 100);
  return {
    id: raw.id || slugAgent(name),
    name,
    role: raw.role || raw.type || "Node",
    status: statusFrom(raw.status, load),
    load,
    color: raw.color || PALETTE[i % PALETTE.length],
  };
}

function agentsFromSessions(sessions: Session[]): Agent[] {
  return sessions.slice(0, 8).map((s, i) => {
    const known = AGENTS.find((a) => a.id === s.agentId);
    const load = clamp(18 + Math.min(s.toolCalls, 80), 8, 96);
    return {
      id: s.agentId || `node-${i}`,
      name: known?.name ?? s.title.slice(0, 18).toUpperCase(),
      role: known?.role ?? s.source,
      status: s.active ? (load > 70 ? "thinking" : "active") : "idle",
      load,
      color: known?.color ?? PALETTE[i % PALETTE.length],
    };
  });
}

function adaptActivity(a: RawActivity, i: number) {
  return {
    id: uid("act"),
    time: a.time || new Date().toLocaleTimeString("en-US", { hour12: false }),
    tool: a.tool_name || a.tool || a.type || "pulse",
    type: a.type || "tool",
    message: a.message || "",
    _i: i,
  };
}

export function adaptDeliverables(raw?: RawDeliverables): Project[] {
  if (!raw) return [];
  const artifacts = raw.artifacts || raw.deliverables || [];
  return (raw.projects || []).map((p) => {
    const kids = artifacts.filter((k) => k.parent_project === p.id);
    const href = p.links?.find((l) => l.url?.startsWith("http"))?.url || kids.find((k) => k.url?.startsWith("http"))?.url;
    return {
      id: p.id || uid("proj"),
      name: p.name || p.title || "Untitled",
      category: p.category || "Programme",
      description: p.description || kids.map((k) => k.title || k.name).filter(Boolean).join(" · ") || "No brief on file.",
      progress: clamp(p.progress ?? 0, 0, 100),
      icon: p.icon || "◈",
      href,
      updated: p.updated || "live",
    };
  });
}

export function adaptDashboard(raw: RawDashboard, prev?: HermesData, projects?: Project[]): HermesData {
  const sessions = (raw.recent_sessions || raw.sessions || []).map(adaptSession);
  const rawAgents = raw.subagents || raw.agents || [];
  const agents = rawAgents.length ? rawAgents.map(adaptAgent) : sessions.length ? agentsFromSessions(sessions) : prev?.agents || [];

  const t = raw.totals || {};
  const tokens = t.tokens ?? (t.input_tokens ?? 0) + (t.output_tokens ?? 0);
  const calls = t.tool_calls ?? 0;
  const prevCalls = prev?.totals.calls ?? calls;
  const spark = prev?.throughput ? [...prev.throughput] : Array.from({ length: 40 }, () => 40);
  const delta = calls - prevCalls;
  const nextPoint = clamp((spark.at(-1) ?? 50) + (delta > 0 ? Math.min(18, delta * 0.2) : -1.5), 8, 98);
  spark.push(nextPoint);
  if (spark.length > 40) spark.shift();

  const sy = raw.system || {};
  const ba = raw.brain_activity || {};
  const activity = (raw.activity_log || raw.activity || []).map(adaptActivity);

  return {
    totals: {
      sessions: t.sessions ?? sessions.length,
      tokens,
      calls,
      cost: t.total_cost ?? t.cost ?? 0,
      messages: t.messages ?? 0,
    },
    cognitiveLoad: clamp(raw.cognitive_load ?? prev?.cognitiveLoad ?? 50, 0, 100),
    system: {
      cpu: sy.cpu ?? prev?.system.cpu ?? 0,
      memoryUsed: sy.memory_used ?? prev?.system.memoryUsed ?? 0,
      memoryTotal: sy.memory_total_gb ?? prev?.system.memoryTotal ?? 32,
      disk: sy.disk_used_pct ?? prev?.system.disk ?? 0,
      networkMb: (sy.network_sent_mb ?? 0) + (sy.network_recv_mb ?? 0) || prev?.system.networkMb || 0,
    },
    brain: {
      reasoning: ba.reasoning ?? prev?.brain.reasoning ?? 0.5,
      toolUse: ba.tool_use ?? prev?.brain.toolUse ?? 0.5,
      memory: ba.memory ?? prev?.brain.memory ?? 0.5,
      output: ba.output ?? prev?.brain.output ?? 0.5,
      reflection: ba.reflection ?? prev?.brain.reflection ?? 0.5,
      proactive: ba.proactive ?? prev?.brain.proactive ?? 0.5,
    },
    sessions: sessions.length ? sessions : prev?.sessions ?? [],
    agents: agents.length ? agents : prev?.agents ?? [],
    projects: projects?.length ? projects : prev?.projects ?? [],
    activity: activity.length ? activity : prev?.activity ?? [],
    tools: (raw.top_tools || []).map((x) => ({
      name: x.name || x.tool_name || "tool",
      count: x.count ?? 0,
    })),
    throughput: spark,
  };
}

export function mergeSessionDetail(data: HermesData, detail: RawSession): HermesData {
  const id = String(detail.id ?? detail.session_id ?? "");
  if (!id) return data;
  const next = adaptSession(detail, 0);
  next.id = id;
  return {
    ...data,
    sessions: data.sessions.some((s) => s.id === id)
      ? data.sessions.map((s) => (s.id === id ? { ...s, ...next, id } : s))
      : [next, ...data.sessions],
  };
}
