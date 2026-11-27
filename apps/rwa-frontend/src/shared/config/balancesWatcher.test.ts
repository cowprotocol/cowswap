import { getBalancesWatcherBaseUrl } from './balancesWatcher'

describe('getBalancesWatcherBaseUrl', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL
  })

  it('uses the watcher of the backend env', () => {
    expect(getBalancesWatcherBaseUrl('prod')).toBe('https://balances-watcher.cow.fi')
    expect(getBalancesWatcherBaseUrl('staging')).toBe('https://balances-watcher.barn.cow.fi')
  })

  it('prefers the configured URL', () => {
    process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL = 'https://watcher.example'

    expect(getBalancesWatcherBaseUrl('prod')).toBe('https://watcher.example')
  })
})
