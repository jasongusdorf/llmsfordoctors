// In-memory stand-in for a Cloudflare KVNamespace. expirationTtl is recorded but not enforced;
// tests needing expiry write an expiresAt in the value directly.
export function createMockKV() {
  const store = new Map<string, string>();
  return {
    store,
    async get(key: string) { return store.has(key) ? store.get(key)! : null; },
    async put(key: string, value: string, _opts?: { expirationTtl?: number }) { store.set(key, value); },
    async delete(key: string) { store.delete(key); },
  };
}
export type MockKV = ReturnType<typeof createMockKV>;
