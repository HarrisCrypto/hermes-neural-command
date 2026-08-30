import { json, options } from "@/app/api/_cors";
import { getFeed, ingestSlime } from "@/lib/server-feed";

export function OPTIONS() {
  return options();
}

export function GET() {
  const feed = getFeed();
  if (!feed.dashboard) {
    return json({ waiting: true });
  }
  return json({ ...feed.dashboard, _ingested_at: feed.updatedAt });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "expected slime JSON" }, 400);
  const stored = ingestSlime(body);
  return json({ ok: true, updatedAt: stored.updatedAt });
}
