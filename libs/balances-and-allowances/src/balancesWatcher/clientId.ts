const STORAGE_KEY = 'balances-watcher-client-id'

let inMemoryFallback: string | null = null

/**
 * Browser-scoped identifier for the balances-watcher session key.
 *
 * The watcher backend indexes sessions by `(chainId, owner, clientId)` so a
 * third party who knows the owner address alone cannot mutate or observe
 * someone else's session — they land on a different session bucket.
 *
 * Generated once per browser via `crypto.randomUUID()` and persisted in
 * `localStorage`; falls back to an in-memory UUID when storage is unavailable
 * (Safari third-party context, quota exceeded, storage disabled). The
 * in-memory value is stable for the lifetime of the tab.
 */
export function getBalancesWatcherClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing

    const fresh = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, fresh)
    // Read-after-write: another tab may have raced us to `setItem`. Take the
    // stored winner so parallel tabs converge on a single id.
    return localStorage.getItem(STORAGE_KEY) ?? fresh
  } catch {
    if (!inMemoryFallback) inMemoryFallback = crypto.randomUUID()
    return inMemoryFallback
  }
}
