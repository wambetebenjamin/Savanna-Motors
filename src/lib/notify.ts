import { SITE } from "@/data/site";

/* ------------------------------------------------------------------ WhatsApp */

/** Public wa.me deep link used by every WhatsApp button on the site. */
export function waLink(message: string, number: string = SITE.whatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const WA_DEFAULT_MESSAGE =
  "Hello! I am interested in a car at Savanna Motors.";

/**
 * Dealer notification.
 *
 * When a WhatsApp Cloud API token is configured the message is pushed straight to
 * the dealer's handset; otherwise the deep link is logged and returned so the
 * caller can surface a click-to-send fallback (plain wa.me).
 */
export async function notifyDealerWhatsApp(text: string): Promise<{
  delivered: boolean;
  fallbackLink: string;
}> {
  const fallbackLink = waLink(text);
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_DEALER_NUMBER ?? SITE.whatsapp;

  if (!token || !phoneId) {
    console.info("[whatsapp:fallback]", text);
    return { delivered: false, fallbackLink };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    });
    return { delivered: res.ok, fallbackLink };
  } catch (error) {
    console.error("[whatsapp:error]", error);
    return { delivered: false, fallbackLink };
  }
}

/* --------------------------------------------------------------------- Email */

type Mail = { to: string; subject: string; text: string };

/**
 * Confirmation email. Uses the SendGrid HTTP API when `SENDGRID_API_KEY` is set
 * (no SMTP egress needed on Vercel); logs otherwise.
 */
export async function sendMail({ to, subject, text }: Mail): Promise<boolean> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.MAIL_FROM ?? SITE.email;

  if (!key) {
    console.info("[mail:fallback]", { to, subject });
    return false;
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: SITE.name },
        reply_to: { email: SITE.email, name: SITE.name },
        subject,
        content: [{ type: "text/plain", value: text }],
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("[mail:error]", error);
    return false;
  }
}
