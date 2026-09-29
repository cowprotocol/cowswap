import ms from 'ms.macro'

const STORAGE_KEY = 'balances-watcher-client-id'

// TTL is evaluated once per tab (on the first call), not per request. That way
// the POST /sessions and SSE /balances handshake always use the same id even
// if the TTL boundary is crossed mid-session; rotation happens on the next
// page load / tab open.
const CLIENT_ID_TTL_MS = ms`1 day`

interface StoredClientId {
  id: string
  createdAt: number
}

let cachedClientId: string | null = null

export function getBalancesWatcherClientId(): string {
  if (cachedClientId) return cachedClientId

  const stored = readStored()
  if (stored && !isExpired(stored)) {
    cachedClientId = stored.id
    return stored.id
  }

  const fresh: StoredClientId = { id: crypto.randomUUID(), createdAt: Date.now() }
  cachedClientId = fresh.id
  tryPersist(fresh)
  return fresh.id
}

function isExpired(entry: StoredClientId): boolean {
  return Date.now() - entry.createdAt >= CLIENT_ID_TTL_MS
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

function readStored(): StoredClientId | null {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function tryPersist(entry: StoredClientId): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // Storage disabled (private mode / quota / blocked). The in-memory cache
    // above still keeps the id stable for this tab.
  }
}
