export type ViewId = "brain" | "projects" | "sessions" | "logs";

export type AgentStatus = "active" | "thinking" | "idle" | "standby";

export type Session = {
  id: string;
  title: string;
  model: string;
  source: string;
  toolCalls: number;
  messages: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  active: boolean;
  startedAt: number;
  agentId: string;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  load: number;
  color: string;
};

export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  progress: number;
  icon: string;
  href?: string;
  updated: string;
};

export type ActivityItem = {
  id: string;
  time: string;
  tool: string;
  type: string;
  message: string;
};

export type ToolStat = {
  name: string;
  count: number;
};

export type SystemMetrics = {
  cpu: number;
  memoryUsed: number;
  memoryTotal: number;
  disk: number;
  networkMb: number;
};

export type BrainActivity = {
  reasoning: number;
  toolUse: number;
  memory: number;
  output: number;
  reflection: number;
  proactive: number;
};

export type Totals = {
  sessions: number;
  tokens: number;
  calls: number;
  cost: number;
  messages: number;
};

export type HermesData = {
  totals: Totals;
  cognitiveLoad: number;
  system: SystemMetrics;
  brain: BrainActivity;
  sessions: Session[];
  agents: Agent[];
  projects: Project[];
  activity: ActivityItem[];
  tools: ToolStat[];
  throughput: number[];
};

export type TranscriptLine = {
  id: string;
  role: "user" | "jarvis";
  text: string;
  at: number;
};

export type JarvisAction = {
  reply: string;
  view?: ViewId;
  selectSessionId?: string;
  focusAgentId?: string | null;
  boost?: boolean;
  voice?: boolean;
};
