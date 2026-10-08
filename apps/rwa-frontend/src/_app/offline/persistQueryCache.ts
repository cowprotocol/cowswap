import type { Query, QueryClient, QueryKey } from '@tanstack/query-core'

import { createInstance } from 'localforage'

export interface QueryPersistenceRules {
  isPersistedQuery(queryKey: QueryKey): boolean
  isPersistableData(data: unknown): boolean
}

interface PersistedEntry {
  data: unknown
  savedAt: number
}

const MAX_ENTRY_AGE_MS = 7 * 24 * 60 * 60 * 1000

let storageInstance: LocalForage | null = null

export function persistQueryCache(queryClient: QueryClient, rules: QueryPersistenceRules): () => void {
  void removeExpiredEntries()

  const queryCache = queryClient.getQueryCache()

  // `atomWithQuery` adds queries to the cache during render, before an effect can subscribe
  queryCache.getAll().forEach((query) => {
    if (rules.isPersistedQuery(query.queryKey)) void restoreQuery(queryClient, query)
  })

  return queryCache.subscribe((event) => {
    const { query } = event

    if (!rules.isPersistedQuery(query.queryKey)) return

    // Restored per query rather than once on startup: unused queries are garbage-collected and re-added later
    if (event.type === 'added') {
      void restoreQuery(queryClient, query)
      return
    }

    if (event.type === 'updated' && event.action.type === 'success' && rules.isPersistableData(query.state.data)) {
      // `savedAt` is the data timestamp, so writing back restored data doesn't extend its lifetime
      const entry: PersistedEntry = { data: query.state.data, savedAt: query.state.dataUpdatedAt }

      void getStorage()
        .setItem(query.queryHash, entry)
        .catch(() => undefined)
    }
  })
}

export async function removeExpiredEntries(): Promise<void> {
  const storage = getStorage()
  const now = Date.now()
  const expiredKeys: string[] = []

  try {
    await storage.iterate<unknown, void>((value, key) => {
      if (!isPersistedEntry(value) || now - value.savedAt >= MAX_ENTRY_AGE_MS) expiredKeys.push(key)
    })
    await Promise.all(expiredKeys.map((key) => storage.removeItem(key)))
  } catch {
    // IndexedDB is unavailable (e.g. private mode), nothing to clean up
  }
}

function getStorage(): LocalForage {
  storageInstance ??= createInstance({ name: 'rwa', storeName: 'queryCache:v1' })

  return storageInstance
}

function isPersistedEntry(value: unknown): value is PersistedEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'savedAt' in value &&
    typeof value.savedAt === 'number'
  )
}

async function restoreQuery(queryClient: QueryClient, query: Query): Promise<void> {
  const entry = await getStorage()
    .getItem<unknown>(query.queryHash)
    .catch(() => null)

  if (!isPersistedEntry(entry) || Date.now() - entry.savedAt >= MAX_ENTRY_AGE_MS) return
  // Data fetched while IndexedDB was being read is fresher than the persisted copy
  if (query.state.data !== undefined) return

  queryClient.setQueryData(query.queryKey, entry.data, { updatedAt: entry.savedAt })
}
