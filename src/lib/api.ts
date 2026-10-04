import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export const json = <T,>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

export const badRequest = (message: string, issues?: unknown) =>
  NextResponse.json({ ok: false, error: message, issues }, { status: 400 });

export const tooMany = (retryAfter: number) =>
  NextResponse.json(
    { ok: false, error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );

export function clientIp(req: Request) {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "anonymous"
  );
}

/* --------------------------------------------------------- rate limiting ---- */

type Bucket = { count: number; reset: number };
const store = globalThis as unknown as { __savannaRate?: Map<string, Bucket> };
store.__savannaRate ??= new Map();

/**
 * Fixed-window limiter for the public write endpoints (financing, enquiries,
 * bookings). Keyed by route + client IP.
 */
export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const bucket = store.__savannaRate!.get(key);

  if (!bucket || bucket.reset < now) {
    store.__savannaRate!.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfter: Math.ceil((bucket.reset - now) / 1000),
    };
  }
  return { ok: true as const, remaining: limit - bucket.count, retryAfter: 0 };
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false as const, error: "Invalid JSON body." };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Please check the highlighted fields.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }
  return { ok: true as const, data: parsed.data };
}

export const reference = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
