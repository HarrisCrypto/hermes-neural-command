import { json, options } from "@/app/api/_cors";
import { getFeed, ingestSlime } from "@/lib/server-feed";

export function OPTIONS() {
  return options();
}

export function GET() {
  const feed = getFeed();
  return json(feed.deliverables ?? { projects: [], artifacts: [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "expected deliverables JSON" }, 400);
  const stored = ingestSlime({ deliverables: body.projects ? body : { projects: body } });
  return json({ ok: true, updatedAt: stored.updatedAt });
}
