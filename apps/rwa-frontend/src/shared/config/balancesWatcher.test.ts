import { getBalancesWatcherBaseUrl } from './balancesWatcher'

describe('getBalancesWatcherBaseUrl', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL
  })

  it.each(['swap.cow.fi', 'staging.swap.cow.fi'])('uses the prod watcher on %s', (hostname) => {
    expect(getBalancesWatcherBaseUrl(hostname)).toBe('https://balances-watcher.cow.fi')
  })

  it.each(['dev.swap.cow.fi', 'rwa-git-feat-cowswap-dev.vercel.app', 'localhost', 'swap.cow.fi.evil.com', undefined])(
    'uses the barn watcher on %s',
    (hostname) => {
      expect(getBalancesWatcherBaseUrl(hostname)).toBe('https://balances-watcher.barn.cow.fi')
    },
  )

  it('prefers the configured URL', () => {
    process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL = 'https://watcher.example'

    expect(getBalancesWatcherBaseUrl('swap.cow.fi')).toBe('https://watcher.example')
  })
})
