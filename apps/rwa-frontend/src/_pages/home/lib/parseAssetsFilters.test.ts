import { type AssetsFilters, parseAssetsFilters } from './parseAssetsFilters'

const DEFAULTS: AssetsFilters = {
  type: null,
  issuers: [],
  chainIds: [],
  minMarketCap: null,
  minVolume24h: null,
  watchlistOnly: false,
}

describe('parseAssetsFilters', () => {
  it('keeps valid persisted filters', () => {
    const filters: AssetsFilters = {
      type: 'index',
      issuers: ['Ondo', 'xStocks'],
      chainIds: [1, 56],
      minMarketCap: 10_000_000,
      minVolume24h: null,
      watchlistOnly: true,
    }

    expect(parseAssetsFilters(filters, DEFAULTS)).toEqual(filters)
  })

  it('falls back to the defaults for a value that is not an object', () => {
    expect(parseAssetsFilters(null, DEFAULTS)).toBe(DEFAULTS)
    expect(parseAssetsFilters('stock', DEFAULTS)).toBe(DEFAULTS)
  })

  it('replaces only the invalid or missing fields', () => {
    expect(
      parseAssetsFilters({ type: 'bond', issuers: ['Ondo', 1], chainIds: [1], minMarketCap: -5 }, DEFAULTS),
    ).toEqual({ ...DEFAULTS, chainIds: [1] })
  })
})
