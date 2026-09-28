import { createInstance } from 'localforage'

import type { Cache, State } from 'swr'

interface PersistedEntry {
  data: unknown
  savedAt: number
}

const MAX_ENTRY_AGE_MS = 7 * 24 * 60 * 60 * 1000

let storageInstance: LocalForage | null = null

export async function createPersistentSwrCache(shouldPersist: (key: string) => boolean): Promise<Cache> {
  const map = new Map<string, State>()
  const storage = getStorage()
  const now = Date.now()

  try {
    await storage.iterate<unknown, void>((value, key) => {
      if (isPersistedEntry(value) && now - value.savedAt < MAX_ENTRY_AGE_MS) {
        map.set(key, { data: value.data })
      } else {
        void storage.removeItem(key)
      }
    })
  } catch {
    // IndexedDB is unavailable (e.g. private mode), fall back to memory-only cache
  }

  return {
    keys: () => map.keys(),
    get: (key) => map.get(key),
    set(key, value) {
      const previousData = map.get(key)?.data
      map.set(key, value)

      if (value.data !== undefined && value.data !== previousData && shouldPersist(key)) {
        void storage.setItem<PersistedEntry>(key, { data: value.data, savedAt: Date.now() }).catch(() => undefined)
      }
    },
    delete(key) {
      map.delete(key)
      void storage.removeItem(key).catch(() => undefined)
    },
  }
}

function getStorage(): LocalForage {
  storageInstance ??= createInstance({ name: 'rwa', storeName: 'swrCache:v1' })

  return storageInstance
}

function isPersistedEntry(value: unknown): value is PersistedEntry {
  return typeof value === 'object' && value !== null && 'data' in value && 'savedAt' in value
}
