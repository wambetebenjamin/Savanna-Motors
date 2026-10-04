/**
 * KES → USD conversion for international buyers.
 *
 * Uses ExchangeRate-API when `EXCHANGE_RATE_API_KEY` is configured, otherwise the
 * free open endpoint, and finally falls back to a pinned reference rate so the
 * price card never renders empty.
 */

const FALLBACK_KES_PER_USD = 129;

type Cache = { value: number; fetchedAt: number };
const store = globalThis as unknown as { __savannaFx?: Cache };

export async function kesPerUsd(): Promise<{ rate: number; live: boolean }> {
  const cached = store.__savannaFx;
  if (cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000) {
    return { rate: cached.value, live: true };
  }

  const key = process.env.EXCHANGE_RATE_API_KEY;
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/USD`
    : "https://open.er-api.com/v6/latest/USD";

  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      conversion_rates?: Record<string, number>;
      rates?: Record<string, number>;
    };
    const rate = data.conversion_rates?.KES ?? data.rates?.KES;
    if (!rate || !Number.isFinite(rate)) throw new Error("no KES rate");
    store.__savannaFx = { value: rate, fetchedAt: Date.now() };
    return { rate, live: true };
  } catch {
    return { rate: FALLBACK_KES_PER_USD, live: false };
  }
}

export const toUsd = (kes: number, rate: number) => kes / rate;
