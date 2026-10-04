import { NextResponse } from "next/server";
import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { testDriveSchema } from "@/lib/schemas";
import { KV_KEYS, kv } from "@/lib/kv";
import { notifyDealerWhatsApp, sendMail } from "@/lib/notify";
import { SITE } from "@/data/site";

export const runtime = "nodejs";

/**
 * POST /api/test-drive — saves the booking, notifies the dealer on WhatsApp and
 * emails the customer a confirmation. An optional refundable M-Pesa reservation
 * deposit is flagged for the sales desk (Daraja STK push is triggered from there).
 */
export async function POST(req: Request) {
  const limit = rateLimit(`test-drive:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, testDriveSchema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const data = parsed.data;
  const ref = reference("TD");
  await kv.pushRecord(KV_KEYS.testDrive, {
    ...data,
    reference: ref,
    createdAt: new Date().toISOString(),
  });

  const summary = [
    `New test drive booking (${ref})`,
    `${data.name} · ${data.phone} · ${data.email}`,
    `Vehicle: ${data.carName}`,
    `When: ${data.date} at ${data.time}`,
    `Where: ${data.location}`,
    data.reserveDeposit
      ? "Customer wants to reserve with a refundable KES 5,000 M-Pesa deposit."
      : "",
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { fallbackLink } = await notifyDealerWhatsApp(summary);

  await sendMail({
    to: data.email,
    subject: `Savanna Motors — test drive confirmed (${ref})`,
    text: `Hello ${data.name},\n\nYour test drive is booked.\n\nVehicle: ${data.carName}\nDate: ${data.date} at ${data.time}\nWhere: ${data.location}\nReference: ${ref}\n\nBring your driving licence and national ID. Free parking is available on site.\n\n${SITE.name}\n${SITE.address.full}\n${SITE.phoneDisplay}`,
  });

  return NextResponse.json({
    ok: true,
    reference: ref,
    message: `Booked for ${data.date} at ${data.time}. A confirmation is on its way to ${data.email} — bring your licence and ID.`,
    whatsappLink: fallbackLink,
    mpesa: data.reserveDeposit
      ? {
          required: true,
          amountKes: 5000,
          note: "Our sales desk will send an M-Pesa STK push (Daraja) to reserve the vehicle. Fully refundable.",
        }
      : { required: false },
  });
}
