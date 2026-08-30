import { json, options } from "@/app/api/_cors";
import { isHttpOrigin } from "@/lib/protocol";

export function OPTIONS() {
  return options();
}

const ALLOWED = new Set(["/api/dashboard.json", "/api/deliverables"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.searchParams.get("origin") || "";
  const path = url.searchParams.get("path") || "/api/dashboard.json";
  if (!isHttpOrigin(origin)) return json({ error: "invalid origin" }, 400);
  const safePath = path.startsWith("/api/session/") || ALLOWED.has(path) ? path : "";
  if (!safePath) return json({ error: "path not allowed" }, 400);

  try {
    const r = await fetch(`${origin.replace(/\/$/, "")}${safePath}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (r.status === 204) return json({ waiting: true }, 204);
    const text = await r.text();
    try {
      return json(JSON.parse(text), r.ok ? 200 : r.status);
    } catch {
      return json({ error: "upstream returned non-JSON", status: r.status }, 502);
    }
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "upstream unreachable" }, 502);
  }
}
