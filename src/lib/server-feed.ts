import { existsSync, readFileSync, writeFileSync } from "fs";
import type { RawDashboard, RawDeliverables, RawSession } from "@/lib/protocol";
import { unwrapSlime } from "@/lib/protocol";

const FILE = "/tmp/hermes-slime.json";

export type StoredFeed = {
  updatedAt: number;
  dashboard: RawDashboard | null;
  deliverables: RawDeliverables | null;
  sessions: Record<string, RawSession>;
};

let cache: StoredFeed | null = null;

function empty(): StoredFeed {
  return { updatedAt: 0, dashboard: null, deliverables: null, sessions: {} };
}

function load(): StoredFeed {
  if (cache) return cache;
  try {
    if (existsSync(FILE)) {
      cache = JSON.parse(readFileSync(FILE, "utf8")) as StoredFeed;
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = empty();
  return cache;
}

function save(next: StoredFeed) {
  cache = next;
  try {
    writeFileSync(FILE, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getFeed() {
  return load();
}

export function ingestSlime(raw: unknown) {
  const current = load();
  const { dashboard, deliverables } = unwrapSlime(raw);
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const session = (obj.session ?? obj.detail) as RawSession | undefined;

  const next: StoredFeed = {
    updatedAt: Date.now(),
    dashboard: dashboard ?? current.dashboard,
    deliverables: deliverables ?? current.deliverables,
    sessions: { ...current.sessions },
  };

  if (session && (session.id || session.session_id)) {
    next.sessions[String(session.id ?? session.session_id)] = session;
  }
  if (dashboard?.recent_sessions) {
    for (const s of dashboard.recent_sessions) {
      const id = String(s.session_id ?? s.id ?? "");
      if (id) next.sessions[id] = { ...next.sessions[id], ...s };
    }
  }

  save(next);
  return next;
}

export function getSession(id: string) {
  return load().sessions[id] ?? null;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Hermes-Origin",
};
