import { json, options } from "@/app/api/_cors";
import { ingestSlime } from "@/lib/server-feed";

export function OPTIONS() {
  return options();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "expected slime JSON" }, 400);
  const stored = ingestSlime(body);
  return json({ ok: true, updatedAt: stored.updatedAt, hasDashboard: Boolean(stored.dashboard) });
}

export function GET() {
  return json({
    accept: "POST slime snapshots from the Hermes agent",
    paths: ["/api/ingest", "/api/dashboard.json", "/api/deliverables", "/ws on the agent"],
  });
}
