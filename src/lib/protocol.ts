/** Raw slime / HERMES NDS v15 payload — matches the original agent dashboard.json + /ws frames. */

export type RawTool = {
  name?: string;
  tool_name?: string;
  count?: number;
};

export type RawSession = {
  session_id?: string | number;
  id?: string | number;
  title?: string;
  name?: string;
  model?: string;
  source?: string;
  tool_calls?: number;
  messages?: number;
  cost?: number;
  input_tokens?: number;
  output_tokens?: number;
  archived?: boolean;
  active?: boolean;
  top_tools?: RawTool[];
};

export type RawAgent = {
  id?: string;
  name?: string;
  role?: string;
  type?: string;
  status?: string;
  load?: number;
  color?: string;
};

export type RawActivity = {
  time?: string;
  tool_name?: string;
  tool?: string;
  type?: string;
  message?: string;
};

export type RawProject = {
  id?: string;
  name?: string;
  title?: string;
  category?: string;
  description?: string;
  icon?: string;
  progress?: number;
  updated?: string;
  links?: Array<{ url?: string; label?: string }>;
};

export type RawArtifact = {
  parent_project?: string;
  title?: string;
  name?: string;
  url?: string;
  category?: string;
  description?: string;
  icon?: string;
};

export type RawDashboard = {
  totals?: {
    sessions?: number;
    input_tokens?: number;
    output_tokens?: number;
    tokens?: number;
    tool_calls?: number;
    total_cost?: number;
    cost?: number;
    messages?: number;
  };
  system?: {
    cpu?: number;
    memory_used?: number;
    memory_total_gb?: number;
    disk_used_pct?: number;
    network_sent_mb?: number;
    network_recv_mb?: number;
  };
  cognitive_load?: number;
  brain_activity?: {
    reasoning?: number;
    tool_use?: number;
    memory?: number;
    output?: number;
    reflection?: number;
    proactive?: number;
  };
  recent_sessions?: RawSession[];
  sessions?: RawSession[];
  subagents?: RawAgent[];
  agents?: RawAgent[];
  top_tools?: RawTool[];
  activity_log?: RawActivity[];
  activity?: RawActivity[];
};

export type RawDeliverables = {
  projects?: RawProject[];
  artifacts?: RawArtifact[];
  deliverables?: RawArtifact[];
};

export type SlimeEnvelope = {
  type?: string;
  slime?: RawDashboard;
  slime_data?: RawDashboard;
  payload?: RawDashboard;
  data?: RawDashboard;
  dashboard?: RawDashboard;
  deliverables?: RawDeliverables;
} & RawDashboard;

export type FeedKind = "websocket" | "polling" | "ingest" | "mesh";

export function defaultHermesOrigin() {
  return (
    process.env.NEXT_PUBLIC_HERMES_ORIGIN?.replace(/\/$/, "") ||
    "https://area-interval-possession-options.trycloudflare.com"
  );
}

export const ORIGIN_STORAGE_KEY = "hermes.origin";

export function unwrapSlime(raw: unknown): { dashboard?: RawDashboard; deliverables?: RawDeliverables } {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as SlimeEnvelope;
  const inner =
    obj.slime ??
    obj.slime_data ??
    (obj.type === "slime" || obj.type === "dashboard" ? obj.payload ?? obj.data ?? obj.dashboard : undefined) ??
    obj.dashboard ??
    obj;

  const deliverables = obj.deliverables;
  const looksLikeDashboard =
    inner &&
    typeof inner === "object" &&
    ("totals" in inner ||
      "recent_sessions" in inner ||
      "cognitive_load" in inner ||
      "brain_activity" in inner ||
      "system" in inner ||
      "activity_log" in inner ||
      "subagents" in inner);

  return {
    dashboard: looksLikeDashboard ? (inner as RawDashboard) : undefined,
    deliverables,
  };
}

export function isHttpOrigin(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
