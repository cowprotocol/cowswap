import { getCoingeckoApi, toCoingeckoEndpoint } from './coingeckoEndpoint'

describe('toCoingeckoEndpoint', () => {
  it.each([
    ['/api/v3/coins/markets?vs_currency=usd&ids=a,b', '/coins/markets'],
    ['/api/v3/coins/ondo-tsla/market_chart?vs_currency=usd&days=7', '/coins/{id}/market_chart'],
    ['/api/v3/rwas/markets?per_page=250&page=2&sparkline=true', '/rwas/markets'],
    ['/api/v3/onchain/networks/eth/tokens/multi/0xa,0xb', '/networks/{network}/tokens/multi/{addresses}'],
    [
      '/api/v3/onchain/networks/base/tokens/0xAbC123/ohlcv/hour?aggregate=1&limit=24',
      '/networks/{network}/tokens/{address}/ohlcv/hour',
    ],
    ['/api/v2/networks/xdai/tokens/multi/0xa', '/networks/{network}/tokens/multi/{addresses}'],
  ])('%s -> %s', (path, endpoint) => {
    expect(toCoingeckoEndpoint(path)).toBe(endpoint)
  })
})

describe('getCoingeckoApi', () => {
  it('tells the API apart by host and key', () => {
    expect(getCoingeckoApi('pro-api.coingecko.com', true)).toBe('pro')
    expect(getCoingeckoApi('api.coingecko.com', true)).toBe('demo')
    expect(getCoingeckoApi('api.coingecko.com', false)).toBe('public')
    expect(getCoingeckoApi('api.geckoterminal.com', false)).toBe('geckoterminal')
    expect(getCoingeckoApi('api.cow.fi', true)).toBeNull()
  })
})
