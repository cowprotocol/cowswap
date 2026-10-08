import { QueryClient, QueryObserver } from '@tanstack/query-core'

import { persistQueryCache, removeExpiredEntries } from './persistQueryCache'
import { RWA_QUERY_PERSISTENCE_RULES } from './QueryCachePersistence'

const mockStore = new Map<string, unknown>()
const mockDropInstance = jest.fn((_options: { name: string; storeName: string }) => Promise.resolve())

jest.mock('localforage', () => ({
  createInstance: () => ({
    getItem: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
    setItem: jest.fn((key: string, value: unknown) => {
      mockStore.set(key, value)
      return Promise.resolve(value)
    }),
    removeItem: jest.fn((key: string) => {
      mockStore.delete(key)
      return Promise.resolve()
    }),
    iterate: jest.fn((callback: (value: unknown, key: string) => void) => {
      ;[...mockStore.entries()].forEach(([key, value]) => callback(value, key))
      return Promise.resolve()
    }),
    dropInstance: mockDropInstance,
  }),
}))

const ASSETS_KEY = ['rwa', 'assets', { page: 1 }]
const ASSETS_HASH = JSON.stringify(ASSETS_KEY)
const DAY_MS = 24 * 60 * 60 * 1000

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function observe(queryClient: QueryClient, queryFn: () => Promise<unknown>): () => void {
  return new QueryObserver(queryClient, { queryKey: ASSETS_KEY, queryFn, retry: false }).subscribe(() => undefined)
}

describe('persistQueryCache', () => {
  let queryClient: QueryClient
  let unsubscribe: () => void

  beforeEach(() => {
    mockStore.clear()
    queryClient = new QueryClient()
    unsubscribe = persistQueryCache(queryClient, RWA_QUERY_PERSISTENCE_RULES)
  })

  afterEach(() => {
    unsubscribe()
    queryClient.clear()
  })

  it('drops the stores of previous versions', async () => {
    await flushPromises()

    expect(mockDropInstance).toHaveBeenCalledWith({ name: 'rwa', storeName: 'queryCache:v1' })
  })

  it('persists successful app queries', async () => {
    queryClient.setQueryData(ASSETS_KEY, { items: [1], degraded: false })
    await flushPromises()

    expect(mockStore.get(ASSETS_HASH)).toEqual({ data: { items: [1], degraded: false }, savedAt: expect.any(Number) })
  })

  it('does not persist degraded responses or non-app queries', async () => {
    queryClient.setQueryData(ASSETS_KEY, { items: [], degraded: true })
    queryClient.setQueryData(['wagmi', 'balance'], { value: 1 })
    await flushPromises()

    expect(mockStore.size).toBe(0)
  })

  it('keeps the last good copy when a degraded response arrives', async () => {
    queryClient.setQueryData(ASSETS_KEY, { items: [1], degraded: false })
    queryClient.setQueryData(ASSETS_KEY, { items: [], degraded: true })
    await flushPromises()

    expect(mockStore.get(ASSETS_HASH)).toEqual({ data: { items: [1], degraded: false }, savedAt: expect.any(Number) })
  })

  it('restores saved data when the query enters the cache and keeps its timestamp', async () => {
    const savedAt = Date.now() - 1000
    mockStore.set(ASSETS_HASH, { data: { items: [1], degraded: false }, savedAt })

    const stop = observe(queryClient, () => new Promise(() => undefined))
    await flushPromises()

    expect(queryClient.getQueryData(ASSETS_KEY)).toEqual({ items: [1], degraded: false })
    expect(queryClient.getQueryState(ASSETS_KEY)?.dataUpdatedAt).toBe(savedAt)
    expect(mockStore.get(ASSETS_HASH)).toEqual({ data: { items: [1], degraded: false }, savedAt })
    stop()
  })

  it('restores queries added to the cache before persistence started', async () => {
    unsubscribe()
    mockStore.set(ASSETS_HASH, { data: { items: [1], degraded: false }, savedAt: Date.now() - 1000 })

    const stop = observe(queryClient, () => new Promise(() => undefined))
    unsubscribe = persistQueryCache(queryClient, RWA_QUERY_PERSISTENCE_RULES)
    await flushPromises()

    expect(queryClient.getQueryData(ASSETS_KEY)).toEqual({ items: [1], degraded: false })
    stop()
  })

  it('does not override data fetched before the restore finished', async () => {
    mockStore.set(ASSETS_HASH, { data: { items: ['old'], degraded: false }, savedAt: Date.now() - 1000 })

    const stop = observe(queryClient, () => Promise.resolve({ items: ['fresh'], degraded: false }))
    await flushPromises()
    await flushPromises()

    expect(queryClient.getQueryData(ASSETS_KEY)).toEqual({ items: ['fresh'], degraded: false })
    stop()
  })

  it('ignores expired entries', async () => {
    mockStore.set(ASSETS_HASH, { data: { items: [1], degraded: false }, savedAt: Date.now() - 8 * DAY_MS })

    const stop = observe(queryClient, () => new Promise(() => undefined))
    await flushPromises()

    expect(queryClient.getQueryData(ASSETS_KEY)).toBeUndefined()
    stop()
  })
})

describe('removeExpiredEntries', () => {
  beforeEach(() => mockStore.clear())

  it('drops expired and malformed entries', async () => {
    mockStore.set('old', { data: {}, savedAt: Date.now() - 8 * DAY_MS })
    mockStore.set('malformed', { data: {} })
    mockStore.set('fresh', { data: {}, savedAt: Date.now() })

    await removeExpiredEntries()

    expect([...mockStore.keys()]).toEqual(['fresh'])
  })
})
