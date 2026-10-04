import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, clientIp, parseBody, rateLimit, reference, tooMany } from "@/lib/api";
import { mpesaConfigured, stkPush } from "@/lib/mpesa";

export const runtime = "nodejs";

const schema = z.object({
  phone: z.string().trim().min(9).max(20),
  amount: z.coerce.number().min(1).max(50000).default(5000),
  carSlug: z.string().trim().max(120).optional(),
});

/**
 * POST /api/mpesa/stk-push — refundable test-drive reservation deposit.
 * Returns a graceful instruction when Daraja credentials are not configured.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`mpesa:${clientIp(req)}`, 3, 60_000);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = await parseBody(req, schema);
  if (!parsed.ok) return badRequest(parsed.error, parsed.issues);

  const ref = reference("DEP");

  try {
    const result = await stkPush({
      phone: parsed.data.phone,
      amount: parsed.data.amount ?? 5000,
      reference: ref,
      description: "Test drive",
    });

    return NextResponse.json({
      ok: true,
      reference: ref,
      configured: mpesaConfigured(),
      message: result.configured
        ? "Check your phone — approve the M-Pesa prompt to reserve the vehicle. The deposit is fully refundable."
        : "Reservation noted. Our sales desk will send the M-Pesa request before your appointment.",
      daraja: "data" in result ? result.data : undefined,
    });
  } catch (error) {
    console.error("[mpesa:error]", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not reach M-Pesa just now. Your test drive is still booked — pay the deposit at the showroom.",
      },
      { status: 502 },
    );
  }
}
