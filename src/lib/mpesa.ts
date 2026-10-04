/**
 * M-Pesa Daraja — STK push used for the optional, refundable test-drive
 * reservation deposit. Falls back to a "pay at the showroom" instruction when
 * credentials are not configured.
 */

const BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const creds = () => ({
  key: process.env.MPESA_CONSUMER_KEY,
  secret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callback: process.env.MPESA_CALLBACK_URL,
});

export const mpesaConfigured = () => {
  const c = creds();
  return Boolean(c.key && c.secret && c.shortcode && c.passkey && c.callback);
};

/** Normalises 07xx / +2547xx / 7xx into the 2547xxxxxxxx format Daraja expects. */
export function normaliseMsisdn(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

async function token() {
  const { key, secret } = creds();
  const res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function stkPush({
  phone,
  amount,
  reference,
  description,
}: {
  phone: string;
  amount: number;
  reference: string;
  description: string;
}) {
  if (!mpesaConfigured()) {
    return {
      ok: false as const,
      configured: false as const,
      message:
        "M-Pesa is not configured on this deployment — our sales desk will send the reservation request manually.",
    };
  }

  const { shortcode, passkey, callback } = creds();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: normaliseMsisdn(phone),
      PartyB: shortcode,
      PhoneNumber: normaliseMsisdn(phone),
      CallBackURL: callback,
      AccountReference: reference.slice(0, 12),
      TransactionDesc: description.slice(0, 13),
    }),
    cache: "no-store",
  });

  const data = (await res.json()) as Record<string, unknown>;
  return { ok: res.ok, configured: true as const, data };
}
