import { loadGtm, setAnalyticsDimension, trackEvent } from './analytics'

describe('analytics', () => {
  beforeEach(() => {
    window.dataLayer = []
    setAnalyticsDimension('chainId', undefined)
    setAnalyticsDimension('userAddress', undefined)
    setAnalyticsDimension('walletName', undefined)
  })

  it('pushes the event with its defined params and the dimensions', () => {
    setAnalyticsDimension('chainId', '1')
    setAnalyticsDimension('walletName', 'Rabby')

    trackEvent('trade_token_select', {
      ticker: 'AAPL',
      issuer: 'xStocks',
      chainId: 1,
      side: 'buy',
      placement: 'stock_tokens',
    })
    trackEvent('assets_filter_change', { changed: 'type', type: undefined, watchlistOnly: false })

    expect(window.dataLayer).toEqual([
      {
        event: 'trade_token_select',
        dimension_chainId: '1',
        dimension_walletName: 'Rabby',
        ticker: 'AAPL',
        issuer: 'xStocks',
        chainId: 1,
        side: 'buy',
        placement: 'stock_tokens',
      },
      {
        event: 'assets_filter_change',
        dimension_chainId: '1',
        dimension_walletName: 'Rabby',
        changed: 'type',
        watchlistOnly: false,
      },
    ])
  })

  it('adds the CoW Swap GTM container once', () => {
    loadGtm()
    loadGtm()

    const scripts = document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtm.js"]')

    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TBX4BV5M')
    expect(window.dataLayer).toEqual([{ 'gtm.start': expect.any(Number), event: 'gtm.js' }])
  })
})
