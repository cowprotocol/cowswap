import ms from 'ms.macro'

import { getBalancesWatcherClientId } from './clientId'

const STORAGE_KEY = 'balances-watcher-client-id'
const TTL_MS = ms`1 day`

function store(id: string, createdAt: number): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, createdAt }))
}

describe('getBalancesWatcherClientId', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('returns the stored id when the entry is fresh', () => {
    jest.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    store('existing-id', Date.now() - ms`1 hour`)

    expect(getBalancesWatcherClientId()).toBe('existing-id')
  })

  it('persists a freshly generated id so subsequent calls return the same value', () => {
    jest.setSystemTime(new Date('2026-07-08T12:00:00Z'))

    const first = getBalancesWatcherClientId()
    const second = getBalancesWatcherClientId()

    expect(first).toBe(second)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string)).toEqual({ id: first, createdAt: Date.now() })
  })

  it('rotates the id after the TTL elapses', () => {
    jest.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    store('old-id', Date.now() - TTL_MS - 1)

    const rotated = getBalancesWatcherClientId()

    expect(rotated).not.toBe('old-id')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)).toEqual({
      id: rotated,
      createdAt: Date.now(),
    })
  })

  it('regenerates the id when the stored value is in the legacy plain-string format', () => {
    // The previous version wrote the id directly (not wrapped in JSON). Any
    // browser upgrading to this build must not keep leaking the pre-TTL id.
    localStorage.setItem(STORAGE_KEY, 'legacy-plain-uuid')

    const rotated = getBalancesWatcherClientId()

    expect(rotated).not.toBe('legacy-plain-uuid')
  })

  it('falls back to an in-memory id when localStorage.getItem throws and reuses it on the next call', () => {
    jest.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const first = getBalancesWatcherClientId()
    const second = getBalancesWatcherClientId()

    expect(first).toBeTruthy()
    expect(first).toBe(second)
    expect(getItemSpy).toHaveBeenCalled()
  })

  it('rotates the in-memory fallback after the TTL elapses', () => {
    jest.setSystemTime(new Date('2026-07-08T12:00:00Z'))
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const first = getBalancesWatcherClientId()
    jest.advanceTimersByTime(TTL_MS + 1)
    const rotated = getBalancesWatcherClientId()

    expect(rotated).not.toBe(first)
  })
})
