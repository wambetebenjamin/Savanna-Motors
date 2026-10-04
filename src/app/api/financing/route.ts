import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { financingSchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";
import { notifyDealerWhatsApp, sendMail } from "@/lib/notify";
import { formatKesShort } from "@/lib/format";
import { SITE } from "@/data/site";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** POST /api/financing — saves the application and notifies the dealer on WhatsApp. */
export async function POST(req: Request) {
  const limit = rateLimit(`financing:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, financingSchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const data = parsed.data;
  const ref = reference("FIN");
  const record = { ...data, reference: ref, createdAt: new Date().toISOString() };

  await kv.pushRecord(KV_KEYS.financing, record);

  const summary = [
    `New financing application (${ref})`,
    `${data.name} · ${data.phone} · ${data.email}`,
    data.carName ? `Vehicle: ${data.carName}` : "Vehicle: not selected yet",
    `Price: ${formatKesShort(data.carPrice)} · Deposit: ${formatKesShort(data.deposit)}`,
    `Term: ${data.termMonths} months at ${data.interestRate}%`,
    `Estimated installment: ${formatKesShort(data.monthlyEstimate)}`,
    `Income type: ${data.employment}`,
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { fallbackLink } = await notifyDealerWhatsApp(summary);

  await sendMail({
    to: data.email,
    subject: `Savanna Motors — financing application ${ref}`,
    text: `Hello ${data.name},\n\nWe have received your financing application.\n\n${summary}\n\nOur finance desk will come back to you within 48 hours. Reply to this email or WhatsApp ${SITE.phoneDisplay} if anything changes.\n\n${SITE.name}\n${SITE.address.full}`,
  });

  return NextResponse.json({
    ok: true,
    reference: ref,
    message:
      "Your application is with our finance desk. Expect a call within 48 hours — we will take it to every bank on our panel.",
    whatsappLink: fallbackLink,
  });
}
