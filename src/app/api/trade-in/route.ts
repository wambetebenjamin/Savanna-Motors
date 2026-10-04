import { NextResponse } from "next/server";
import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { tradeInSchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";
import { notifyDealerWhatsApp } from "@/lib/notify";
import { formatNumber } from "@/lib/format";

export const runtime = "nodejs";

/** POST /api/trade-in — saves the trade-in enquiry and pings the dealer. */
export async function POST(req: Request) {
  const limit = rateLimit(`trade-in:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, tradeInSchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const data = parsed.data;
  const ref = reference("TI");
  await kv.pushRecord(KV_KEYS.tradeIn, {
    ...data,
    reference: ref,
    createdAt: new Date().toISOString(),
  });

  const summary = [
    `New trade-in enquiry (${ref})`,
    `${data.name} · ${data.phone}`,
    `Vehicle: ${data.year} ${data.make} ${data.model}`,
    `Mileage: ${formatNumber(data.mileageKm)} km · Condition: ${data.condition}`,
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { fallbackLink } = await notifyDealerWhatsApp(summary);

  return NextResponse.json({
    ok: true,
    reference: ref,
    message:
      "Thanks — our valuations team will call you with an indicative figure today, and the written offer is valid for seven days.",
    whatsappLink: fallbackLink,
  });
}
