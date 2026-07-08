import ms from 'ms.macro'

const STORAGE_KEY = 'balances-watcher-client-id'

// Rotated only on the next call after a new tab opens or an existing one is refreshed.
const CLIENT_ID_TTL_MS = ms`1 day`

interface StoredClientId {
  id: string
  createdAt: number
}

let inMemoryFallback: StoredClientId | null = null

export function getBalancesWatcherClientId(): string {
  try {
    const stored = parseStored(localStorage.getItem(STORAGE_KEY))
    if (stored && !isExpired(stored)) return stored.id

    const fresh: StoredClientId = { id: crypto.randomUUID(), createdAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh.id
  } catch {
    if (!inMemoryFallback || isExpired(inMemoryFallback)) {
      inMemoryFallback = { id: crypto.randomUUID(), createdAt: Date.now() }
    }
    return inMemoryFallback.id
  }
}

function parseStored(raw: string | null): StoredClientId | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredClientId).id === 'string' &&
      typeof (parsed as StoredClientId).createdAt === 'number'
    ) {
      return parsed as StoredClientId
    }
  } catch {
    return null
  }
  return null
}

function isExpired(entry: StoredClientId): boolean {
  return Date.now() - entry.createdAt >= CLIENT_ID_TTL_MS
}
