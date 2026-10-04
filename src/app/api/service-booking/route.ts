import { NextResponse } from "next/server";
import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { serviceBookingSchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";
import { notifyDealerWhatsApp, sendMail } from "@/lib/notify";
import { SITE } from "@/data/site";

export const runtime = "nodejs";

/** POST /api/service-booking — saves the appointment and confirms on WhatsApp. */
export async function POST(req: Request) {
  const limit = rateLimit(`service:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, serviceBookingSchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const data = parsed.data;
  const ref = reference("SV");
  await kv.pushRecord(KV_KEYS.serviceBooking, {
    ...data,
    reference: ref,
    createdAt: new Date().toISOString(),
  });

  const summary = [
    `New service booking (${ref})`,
    `${data.name} · ${data.phone}`,
    `Service: ${data.service}`,
    `Vehicle: ${data.vehicle}`,
    `Drop-off: ${data.date} at ${data.time}`,
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { fallbackLink } = await notifyDealerWhatsApp(summary);

  if (data.email) {
    await sendMail({
      to: data.email,
      subject: `Savanna Motors — service booking ${ref}`,
      text: `Hello ${data.name},\n\nYour ${data.service} is booked for ${data.date} at ${data.time}.\nVehicle: ${data.vehicle}\nReference: ${ref}\n\nWe will send the quote before any work starts.\n\n${SITE.name} Service Centre\n${SITE.address.full}\n${SITE.phoneDisplay}`,
    });
  }

  return NextResponse.json({
    ok: true,
    reference: ref,
    message: `${data.service} booked for ${data.date} at ${data.time}. We will confirm on WhatsApp and send a quote before any work starts.`,
    whatsappLink: fallbackLink,
  });
}
