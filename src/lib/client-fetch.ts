type CacheEntry = {
  data?: unknown;
  expiresAt: number;
  promise?: Promise<unknown>;
};

const DEFAULT_TTL_MS = 5000;
const clientGetCache = new Map<string, CacheEntry>();

function getCacheKey(input: string | URL, method: string) {
  return `${method}:${typeof input === "string" ? input : input.toString()}`;
}

export async function fetchJsonCached<T>(
  input: string | URL,
  init?: RequestInit,
  options?: {
    force?: boolean;
    ttlMs?: number;
  },
): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();

  if (method !== "GET") {
    throw new Error("fetchJsonCached only supports GET requests.");
  }

  const cacheKey = getCacheKey(input, method);
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();

  if (options?.force) {
    clientGetCache.delete(cacheKey);
  }

  const existing = clientGetCache.get(cacheKey);

  if (existing?.data !== undefined && existing.expiresAt > now) {
    return existing.data as T;
  }

  if (existing?.promise) {
    return existing.promise as Promise<T>;
  }

  const promise = fetch(input, init)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as T;
      clientGetCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    })
    .catch((error) => {
      clientGetCache.delete(cacheKey);
      throw error;
    });

  clientGetCache.set(cacheKey, {
    promise,
    expiresAt: now + ttlMs,
  });

  return promise;
}

export function invalidateClientFetch(...inputs: Array<string | URL>) {
  for (const input of inputs) {
    clientGetCache.delete(getCacheKey(input, "GET"));
  }
}
