import { getBalancesWatcherClientId } from './clientId'

const STORAGE_KEY = 'balances-watcher-client-id'

describe('getBalancesWatcherClientId', () => {
  afterEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('returns the value already stored in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'existing-id')

    expect(getBalancesWatcherClientId()).toBe('existing-id')
  })

  it('persists a freshly generated id so subsequent calls return the same value', () => {
    const first = getBalancesWatcherClientId()
    const second = getBalancesWatcherClientId()

    expect(first).toBe(second)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(first)
  })

  it('falls back to an in-memory id and stays stable when localStorage.getItem throws', () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const first = getBalancesWatcherClientId()
    const second = getBalancesWatcherClientId()

    expect(first).toBeTruthy()
    expect(first).toBe(second)
    // Confirm we actually hit the throwing path rather than the persisted branch.
    expect(getItemSpy).toHaveBeenCalled()
  })
})
