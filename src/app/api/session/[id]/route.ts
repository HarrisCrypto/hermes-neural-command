import { json, options } from "@/app/api/_cors";
import { getSession, ingestSlime } from "@/lib/server-feed";

export function OPTIONS() {
  return options();
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) return json({ error: "session not on the lattice" }, 404);
  return json({ ...session, id: session.id ?? session.session_id ?? id });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "expected session JSON" }, 400);
  ingestSlime({ session: { ...body, id: body.id ?? body.session_id ?? id } });
  return json({ ok: true, id });
}
