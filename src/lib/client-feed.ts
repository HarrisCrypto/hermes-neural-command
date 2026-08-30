import { adaptDashboard, adaptDeliverables } from "@/lib/adapt";
import { defaultHermesOrigin, isHttpOrigin, unwrapSlime } from "@/lib/protocol";
import type { FeedKind } from "@/lib/protocol";
import type { HermesData } from "@/lib/types";

export type LiveSnapshot = {
  data: HermesData;
  kind: Exclude<FeedKind, "mesh">;
};

async function pullJson(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!r.ok) return null;
  const body = await r.json().catch(() => null);
  if (!body || body.waiting) return null;
  return body;
}

export async function pullSnapshot(
  origin: string,
  prev?: HermesData,
): Promise<LiveSnapshot | null> {
  const localDash = await pullJson("/api/dashboard.json");
  const localDel = await pullJson("/api/deliverables");
  if (localDash && !localDash.waiting) {
    const { dashboard, deliverables } = unwrapSlime(localDash);
    if (dashboard) {
      return {
        kind: "ingest",
        data: adaptDashboard(dashboard, prev, adaptDeliverables(deliverables || localDel || undefined)),
      };
    }
  }

  if (!isHttpOrigin(origin)) return null;
  const encoded = encodeURIComponent(origin.replace(/\/$/, ""));
  const remoteDash = await pullJson(`/api/upstream?origin=${encoded}&path=${encodeURIComponent("/api/dashboard.json")}`);
  if (!remoteDash) return null;
  const remoteDel = await pullJson(`/api/upstream?origin=${encoded}&path=${encodeURIComponent("/api/deliverables")}`);
  const { dashboard, deliverables } = unwrapSlime(remoteDash);
  if (!dashboard) return null;
  return {
    kind: "polling",
    data: adaptDashboard(dashboard, prev, adaptDeliverables(deliverables || remoteDel || undefined)),
  };
}

export function openAgentSocket(
  origin: string,
  onFrame: (data: HermesData, kind: FeedKind) => void,
  getPrev: () => HermesData,
) {
  if (!isHttpOrigin(origin) || typeof window === "undefined") return () => {};
  let ws: WebSocket | null = null;
  let retry = 0;
  let closed = false;
  let timer: number | null = null;

  const connect = () => {
    if (closed) return;
    const wsUrl = `${origin.replace(/^http/, "ws").replace(/\/$/, "")}/ws`;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      schedule();
      return;
    }
    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const { dashboard, deliverables } = unwrapSlime(raw);
        if (!dashboard) return;
        retry = 0;
        onFrame(adaptDashboard(dashboard, getPrev(), adaptDeliverables(deliverables)), "websocket");
      } catch {
        /* ignore malformed slime frames */
      }
    };
    ws.onopen = () => {
      retry = 0;
    };
    ws.onerror = () => {
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => schedule();
  };

  const schedule = () => {
    if (closed) return;
    retry += 1;
    timer = window.setTimeout(connect, Math.min(3000 * retry, 30000));
  };

  connect();
  return () => {
    closed = true;
    if (timer) window.clearTimeout(timer);
    try {
      ws?.close();
    } catch {
      /* ignore */
    }
  };
}

export function readStoredOrigin() {
  if (typeof window === "undefined") return defaultHermesOrigin();
  return window.localStorage.getItem("hermes.origin") || defaultHermesOrigin();
}

export function writeStoredOrigin(origin: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("hermes.origin", origin.replace(/\/$/, ""));
  window.dispatchEvent(new Event("hermes-origin"));
}

export function subscribeOrigin(onChange: () => void) {
  window.addEventListener("hermes-origin", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("hermes-origin", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readOriginSnapshot() {
  return window.localStorage.getItem("hermes.origin") || defaultHermesOrigin();
}
