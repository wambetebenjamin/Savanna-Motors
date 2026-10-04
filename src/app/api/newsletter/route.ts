import { NextResponse } from "next/server";
import { badRequest, clientIp, parseBody, rateLimit, tooMany } from "@/lib/api";
import { newsletterSchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";

export const runtime = "nodejs";

/** POST /api/newsletter — stores the subscriber in Vercel KV (a set, so no duplicates). */
export async function POST(req: Request) {
  const limit = rateLimit(`newsletter:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, newsletterSchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const isNew = await kv.addToSet(KV_KEYS.newsletter, parsed.data.email.toLowerCase());

  return NextResponse.json({
    ok: true,
    message: isNew
      ? "You are on the list — new arrivals every Friday."
      : "You are already subscribed.",
  });
}

/** GET /api/newsletter — subscriber count (no addresses exposed). */
export async function GET() {
  return NextResponse.json({ ok: true, subscribers: await kv.countSet(KV_KEYS.newsletter) });
}
