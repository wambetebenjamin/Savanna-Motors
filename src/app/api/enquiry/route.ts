import { NextResponse } from "next/server";
import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { enquirySchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";
import { notifyDealerWhatsApp, sendMail } from "@/lib/notify";
import { SITE } from "@/data/site";
import { getCar } from "@/data/cars";

export const runtime = "nodejs";

/** POST /api/enquiry — general and per-car enquiries. Rate limited. */
export async function POST(req: Request) {
  const limit = rateLimit(`enquiry:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, enquirySchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const data = parsed.data;
  const car = data.carSlug ? getCar(data.carSlug) : undefined;
  const ref = reference("ENQ");

  await kv.pushRecord(KV_KEYS.enquiry, {
    ...data,
    reference: ref,
    createdAt: new Date().toISOString(),
  });

  const summary = [
    `New enquiry (${ref})`,
    `${data.name} · ${data.phone} · ${data.email}`,
    car ? `Vehicle: ${car.year} ${car.make} ${car.model}` : data.subject ?? "General",
    data.message,
  ].join("\n");

  const { fallbackLink } = await notifyDealerWhatsApp(summary);

  await sendMail({
    to: data.email,
    subject: `Savanna Motors — we received your enquiry (${ref})`,
    text: `Hello ${data.name},\n\nThanks for getting in touch. A member of the sales desk will reply within one working day.\n\nYour message:\n${data.message}\n\n${SITE.name}\n${SITE.address.full}\n${SITE.phoneDisplay}`,
  });

  return NextResponse.json({
    ok: true,
    reference: ref,
    message: "Got it. We reply within one working day — usually much sooner on WhatsApp.",
    whatsappLink: fallbackLink,
  });
}
