import { grantGoogleConsent } from '@cowprotocol/analytics/consent'

import { loadGtm, setAnalyticsDimension, trackEvent } from './analytics'

const mockConsent = { accepted: true }

jest.mock('@cowprotocol/analytics/consent', () => ({
  grantGoogleConsent: jest.fn(),
  hasAcceptedCookies: () => mockConsent.accepted,
}))

describe('analytics', () => {
  beforeEach(() => {
    window.dataLayer = []
    mockConsent.accepted = true
    setAnalyticsDimension('chainId', undefined)
    setAnalyticsDimension('userAddress', undefined)
    setAnalyticsDimension('walletName', undefined)
  })

  it('pushes the event with its defined params and the dimensions, keeping null params', () => {
    setAnalyticsDimension('chainId', '1')
    setAnalyticsDimension('walletName', 'Rabby')

    trackEvent('trade_token_select', {
      ticker: 'AAPL',
      issuer: 'xStocks',
      chainId: 1,
      side: 'buy',
      placement: 'stock_tokens',
    })
    trackEvent('set_user_account', { userId: undefined })
    trackEvent('assets_filter_change', {
      changed: 'issuers',
      type: null,
      issuers: null,
      chainIds: null,
      minMarketCap: null,
      minVolume24h: null,
      watchlistOnly: false,
    })

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
      { event: 'set_user_account', dimension_chainId: '1', dimension_walletName: 'Rabby' },
      {
        event: 'assets_filter_change',
        dimension_chainId: '1',
        dimension_walletName: 'Rabby',
        changed: 'issuers',
        type: null,
        issuers: null,
        chainIds: null,
        minMarketCap: null,
        minVolume24h: null,
        watchlistOnly: false,
      },
    ])
  })

  it('drops events until cookies are accepted', () => {
    mockConsent.accepted = false

    trackEvent('set_user_account', { userId: undefined })

    expect(window.dataLayer).toEqual([])
  })

  it('adds the CoW Swap GTM container once', () => {
    loadGtm()
    loadGtm()

    const scripts = document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtm.js"]')

    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TBX4BV5M')
    expect(window.dataLayer).toEqual([{ 'gtm.start': expect.any(Number), event: 'gtm.js' }])
    expect(grantGoogleConsent).toHaveBeenCalledTimes(1)
  })
})
