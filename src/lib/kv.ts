/**
 * Thin Vercel KV client.
 *
 * Uses the Vercel KV / Upstash REST API when `KV_REST_API_URL` + `KV_REST_API_TOKEN`
 * are present (they are injected automatically when a KV store is attached to the
 * Vercel project). Falls back to an in-process store so local development and
 * previews work without any credentials.
 */

const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const enabled = Boolean(URL_ && TOKEN);

type Json = unknown;

const memory = globalThis as unknown as {
  __savannaKv?: Map<string, Json[]>;
  __savannaKvSet?: Map<string, Set<string>>;
};
memory.__savannaKv ??= new Map();
memory.__savannaKvSet ??= new Map();

async function command(args: (string | number)[]): Promise<{ result: unknown }> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV error ${res.status}`);
  return (await res.json()) as { result: unknown };
}

export const kv = {
  enabled,

  /** Push a record onto a list (newest first) and keep the list bounded. */
  async pushRecord(key: string, value: Json, keep = 500) {
    if (enabled) {
      await command(["LPUSH", key, JSON.stringify(value)]);
      await command(["LTRIM", key, 0, keep - 1]);
      return;
    }
    const list = memory.__savannaKv!.get(key) ?? [];
    list.unshift(value);
    memory.__savannaKv!.set(key, list.slice(0, keep));
  },

  async listRecords<T = Json>(key: string, limit = 50): Promise<T[]> {
    if (enabled) {
      const { result } = await command(["LRANGE", key, 0, limit - 1]);
      return ((result as string[]) ?? []).map((r) => JSON.parse(r) as T);
    }
    return ((memory.__savannaKv!.get(key) ?? []) as T[]).slice(0, limit);
  },

  /** Returns true when the member was newly added (used by the newsletter). */
  async addToSet(key: string, member: string): Promise<boolean> {
    if (enabled) {
      const { result } = await command(["SADD", key, member]);
      return result === 1;
    }
    const set = memory.__savannaKvSet!.get(key) ?? new Set<string>();
    const isNew = !set.has(member);
    set.add(member);
    memory.__savannaKvSet!.set(key, set);
    return isNew;
  },

  async countSet(key: string): Promise<number> {
    if (enabled) {
      const { result } = await command(["SCARD", key]);
      return Number(result ?? 0);
    }
    return memory.__savannaKvSet!.get(key)?.size ?? 0;
  },
};

export const KV_KEYS = {
  financing: "savanna:financing",
  testDrive: "savanna:test-drive",
  tradeIn: "savanna:trade-in",
  serviceBooking: "savanna:service-booking",
  enquiry: "savanna:enquiry",
  newsletter: "savanna:newsletter",
} as const;
