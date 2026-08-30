import type {
  ActivityItem,
  Agent,
  BrainActivity,
  HermesData,
  Project,
  Session,
  SystemMetrics,
} from "@/lib/types";
import { clamp, uid } from "@/lib/format";

const MODELS = [
  "hermes-core-15",
  "atlas-reasoner",
  "mnemo-embed",
  "iris-vision",
  "forge-code",
];

const TOOLS = [
  "read_file",
  "search",
  "compile",
  "browser",
  "deploy",
  "analyze",
  "memory_write",
  "plan",
  "patch",
  "simulate",
];

const ACTIVITY = [
  ["analyze", "Completed cortical sweep of overnight traces"],
  ["search", "Indexed 1,284 new synaptic fragments"],
  ["compile", "Rebuilt routing graph for ATHENA"],
  ["memory_write", "Compressed episodic buffer — 12% reclaim"],
  ["plan", "Queued three follow-up tool chains"],
  ["browser", "Fetched telemetry from orbital node 7"],
  ["patch", "Stabilized reflection loop jitter"],
  ["simulate", "Ran 400-step counterfactual on session 18"],
  ["deploy", "Pushed holographic overlay revision"],
  ["read_file", "Ingested architecture brief: payments edge"],
  ["analyze", "Threat surface delta within tolerance"],
  ["compile", "Shader pack warm — bloom path verified"],
];

export const AGENTS: Agent[] = [
  { id: "athena", name: "ATHENA", role: "Reasoning", status: "thinking", load: 78, color: "#00f0ff" },
  { id: "hephaestus", name: "HEPHAESTUS", role: "Tools", status: "active", load: 64, color: "#a855f7" },
  { id: "mnemosyne", name: "MNEMOSYNE", role: "Memory", status: "active", load: 51, color: "#ec4899" },
  { id: "iris", name: "IRIS", role: "Perception", status: "idle", load: 22, color: "#22d3ee" },
  { id: "daedalus", name: "DAEDALUS", role: "Planning", status: "thinking", load: 71, color: "#fbbf24" },
  { id: "argus", name: "ARGUS", role: "Watch", status: "active", load: 44, color: "#34d399" },
  { id: "orpheus", name: "ORPHEUS", role: "Language", status: "idle", load: 18, color: "#fb7185" },
  { id: "prometheus", name: "PROMETHEUS", role: "Synthesis", status: "active", load: 59, color: "#38bdf8" },
];

const SESSION_SEEDS: Array<Pick<Session, "title" | "source" | "agentId">> = [
  { title: "Overnight market synthesis", source: "cron", agentId: "athena" },
  { title: "Payments edge code review", source: "studio", agentId: "hephaestus" },
  { title: "Threat surface scan — east", source: "watch", agentId: "argus" },
  { title: "Investor brief draft", source: "desk", agentId: "orpheus" },
  { title: "Memory compaction cycle", source: "core", agentId: "mnemosyne" },
  { title: "Vision pipeline calibration", source: "lab", agentId: "iris" },
  { title: "Launch sequence rehearsal", source: "ops", agentId: "daedalus" },
  { title: "Counterfactual policy sweep", source: "research", agentId: "prometheus" },
  { title: "Holographic HUD refresh", source: "studio", agentId: "hephaestus" },
  { title: "Voice lattice retune", source: "core", agentId: "orpheus" },
  { title: "Satellite downlink decode", source: "watch", agentId: "iris" },
  { title: "Session 47 continuity lock", source: "core", agentId: "athena" },
];

export const PROJECTS: Project[] = [
  {
    id: "p-hermes",
    name: "HERMES Neural Core",
    category: "Command",
    description: "Live holographic command surface with Jarvis-class cognition and agent constellation.",
    progress: 92,
    icon: "◈",
    href: "/",
    updated: "live",
  },
  {
    id: "p-atlas",
    name: "Atlas Reasoner",
    category: "Cognition",
    description: "Long-horizon planning mesh that fans work across ATHENA and DAEDALUS.",
    progress: 74,
    icon: "△",
    updated: "12m ago",
  },
  {
    id: "p-iris",
    name: "IRIS Perception Stack",
    category: "Vision",
    description: "Multi-sensor fusion for orbital and ground imagery with holographic replay.",
    progress: 61,
    icon: "◎",
    updated: "28m ago",
  },
  {
    id: "p-vault",
    name: "Mnemosyne Vault",
    category: "Memory",
    description: "Compressed episodic store with synaptic recall under 40ms.",
    progress: 88,
    icon: "▣",
    updated: "6m ago",
  },
  {
    id: "p-forge",
    name: "Hephaestus Forge",
    category: "Tools",
    description: "Autonomous patch, compile, and deploy loop with signed artifacts.",
    progress: 55,
    icon: "⚒",
    updated: "41m ago",
  },
  {
    id: "p-argus",
    name: "Argus Watchnet",
    category: "Defense",
    description: "Always-on anomaly lattice across sessions, cost, and outbound calls.",
    progress: 80,
    icon: "◉",
    updated: "3m ago",
  },
];

function seedSessions(): Session[] {
  const now = Date.now();
  return SESSION_SEEDS.map((seed, i) => {
    const toolCalls = 40 + Math.round(Math.random() * 420);
    const messages = 12 + Math.round(Math.random() * 180);
    const inputTokens = 8000 + Math.round(Math.random() * 240000);
    const outputTokens = 2000 + Math.round(Math.random() * 80000);
    return {
      id: `ses-${1000 + i}`,
      title: seed.title,
      model: MODELS[i % MODELS.length],
      source: seed.source,
      toolCalls,
      messages,
      cost: toolCalls * 0.014 + outputTokens * 0.000008,
      inputTokens,
      outputTokens,
      active: i < 8,
      startedAt: now - (i + 1) * 1000 * 60 * (8 + i * 7),
      agentId: seed.agentId,
    };
  });
}

function seedActivity(n: number): ActivityItem[] {
  const items: ActivityItem[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const [tool, message] = ACTIVITY[i % ACTIVITY.length];
    const t = new Date(now - i * 14000);
    items.push({
      id: uid("act"),
      time: t.toLocaleTimeString("en-US", { hour12: false }),
      tool,
      type: "tool",
      message,
    });
  }
  return items;
}

function seedThroughput() {
  return Array.from({ length: 40 }, () => 28 + Math.random() * 52);
}

export function createInitialData(): HermesData {
  const sessions = seedSessions();
  const tokens = sessions.reduce((a, s) => a + s.inputTokens + s.outputTokens, 0);
  const calls = sessions.reduce((a, s) => a + s.toolCalls, 0);
  const cost = sessions.reduce((a, s) => a + s.cost, 0);
  const messages = sessions.reduce((a, s) => a + s.messages, 0);

  const toolMap = new Map<string, number>();
  TOOLS.forEach((name, i) => toolMap.set(name, 30 + (TOOLS.length - i) * 18 + Math.round(Math.random() * 40)));

  return {
    totals: {
      sessions: sessions.length + 35,
      tokens,
      calls,
      cost,
      messages,
    },
    cognitiveLoad: 58,
    system: {
      cpu: 41,
      memoryUsed: 18.4,
      memoryTotal: 32,
      disk: 54,
      networkMb: 126,
    },
    brain: {
      reasoning: 0.72,
      toolUse: 0.64,
      memory: 0.51,
      output: 0.58,
      reflection: 0.44,
      proactive: 0.61,
    },
    sessions,
    agents: AGENTS.map((a) => ({ ...a })),
    projects: PROJECTS.map((p) => ({ ...p })),
    activity: seedActivity(28),
    tools: [...toolMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    throughput: seedThroughput(),
  };
}

function wander(value: number, delta: number, min: number, max: number) {
  return clamp(value + (Math.random() - 0.48) * delta, min, max);
}

export function tickSystem(sys: SystemMetrics): SystemMetrics {
  return {
    cpu: wander(sys.cpu, 6, 12, 92),
    memoryUsed: wander(sys.memoryUsed, 0.35, 10, 30.5),
    memoryTotal: sys.memoryTotal,
    disk: wander(sys.disk, 0.4, 40, 78),
    networkMb: wander(sys.networkMb, 8, 40, 420),
  };
}

export function tickBrain(brain: BrainActivity, load: number, thinking: boolean): BrainActivity {
  const boost = thinking ? 0.12 : 0;
  const l = load / 100;
  return {
    reasoning: wander(brain.reasoning, 0.06, 0.25, 0.98) * 0.7 + (l + boost) * 0.3,
    toolUse: wander(brain.toolUse, 0.07, 0.2, 0.96),
    memory: wander(brain.memory, 0.04, 0.22, 0.9),
    output: wander(brain.output, 0.05, 0.2, 0.95),
    reflection: wander(brain.reflection, 0.05, 0.15, 0.88),
    proactive: wander(brain.proactive, 0.05, 0.18, 0.92),
  };
}

export function nextActivity(): ActivityItem {
  const [tool, message] = ACTIVITY[Math.floor(Math.random() * ACTIVITY.length)];
  return {
    id: uid("act"),
    time: new Date().toLocaleTimeString("en-US", { hour12: false }),
    tool,
    type: "tool",
    message,
  };
}

export function tickData(prev: HermesData, thinking: boolean, boosted: boolean): HermesData {
  const loadBase = thinking ? 16 : boosted ? 10 : 0;
  const cognitiveLoad = wander(prev.cognitiveLoad, 7 + loadBase * 0.3, 18 + loadBase, 94);
  const callsDelta = Math.random() > 0.45 ? 1 + Math.floor(Math.random() * 4) : 0;
  const tokenDelta = 40 + Math.floor(Math.random() * 180);
  const msgDelta = Math.random() > 0.6 ? 1 : 0;
  const costDelta = callsDelta * 0.012 + tokenDelta * 0.000004;

  const sessions = prev.sessions.map((s, i) => {
    if (!s.active || Math.random() > 0.35) return s;
    const extraCalls = i % 3 === 0 ? 1 : 0;
    return {
      ...s,
      toolCalls: s.toolCalls + extraCalls,
      messages: s.messages + (Math.random() > 0.7 ? 1 : 0),
      inputTokens: s.inputTokens + Math.floor(Math.random() * 80),
      outputTokens: s.outputTokens + Math.floor(Math.random() * 40),
      cost: s.cost + extraCalls * 0.01,
    };
  });

  const agents = prev.agents.map((a) => {
    const load = wander(a.load, thinking && a.status === "thinking" ? 10 : 7, 8, 96);
    let status = a.status;
    if (load > 70) status = "thinking";
    else if (load > 40) status = "active";
    else if (load > 18) status = "idle";
    else status = "standby";
    return { ...a, load, status };
  });

  const throughput = [...prev.throughput, clamp(prev.throughput.at(-1)! + (Math.random() - 0.45) * 10 + (thinking ? 8 : 0), 8, 98)];
  if (throughput.length > 40) throughput.shift();

  const tools = prev.tools.map((t, i) =>
    i < 3 && Math.random() > 0.5 ? { ...t, count: t.count + 1 } : t,
  );

  return {
    ...prev,
    totals: {
      sessions: prev.totals.sessions,
      tokens: prev.totals.tokens + tokenDelta,
      calls: prev.totals.calls + callsDelta,
      cost: prev.totals.cost + costDelta,
      messages: prev.totals.messages + msgDelta,
    },
    cognitiveLoad,
    system: tickSystem(prev.system),
    brain: tickBrain(prev.brain, cognitiveLoad, thinking),
    sessions,
    agents,
    tools: tools.sort((a, b) => b.count - a.count),
    throughput,
  };
}
