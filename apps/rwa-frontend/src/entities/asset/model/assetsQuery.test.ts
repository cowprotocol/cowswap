/**
 * @jest-environment node
 */
import { paginate, searchAssets, sortAssets } from './assetsQuery'

import type { RwaAssetWithMarket, RwaMarketData } from './types'

function asset(
  ticker: string,
  title: string,
  priority: number,
  marketData: RwaMarketData | null,
  symbols: string[] = [],
): RwaAssetWithMarket {
  return {
    ticker,
    title,
    type: 'stock',
    priority,
    tokens: symbols.map((symbol) => ({
      chainId: 1,
      address: '0x0000000000000000000000000000000000000001',
      symbol,
      name: symbol,
      decimals: 18,
      issuer: 'Ondo',
    })),
    market: marketData,
  }
}

function market(overrides: Partial<RwaMarketData>): RwaMarketData {
  return {
    price: 1,
    change24h: 0,
    dayLow: 1,
    dayHigh: 1,
    marketCap: 1,
    volume24h: 1,
    tokens: {},
    updatedAt: null,
    ...overrides,
  }
}

const AAPL = asset('AAPL', 'Apple', 10, market({ marketCap: 100, change24h: 1 }), ['AAPLx', 'AAPLon'])
const MSFT = asset('MSFT', 'Microsoft', 10, market({ marketCap: 300, change24h: -2 }), ['MSFTx'])
const NVDA = asset('NVDA', 'NVIDIA', 9, market({ marketCap: 200, change24h: 3 }), ['NVDAon'])
const META = asset('META', 'Meta Platforms', 6, null, ['METAx'])

const tickers = (assets: RwaAssetWithMarket[]): string[] => assets.map(({ ticker }) => ticker)

describe('sortAssets', () => {
  it('sorts by priority desc with ticker as a tie-breaker', () => {
    expect(tickers(sortAssets([NVDA, META, MSFT, AAPL], 'priority', 'desc'))).toEqual(['AAPL', 'MSFT', 'NVDA', 'META'])
  })

  it('keeps assets without market data last in both orders', () => {
    expect(tickers(sortAssets([META, AAPL, NVDA, MSFT], 'marketCap', 'desc'))).toEqual(['MSFT', 'NVDA', 'AAPL', 'META'])
    expect(tickers(sortAssets([META, AAPL, NVDA, MSFT], 'marketCap', 'asc'))).toEqual(['AAPL', 'NVDA', 'MSFT', 'META'])
  })

  it('sorts by ticker alphabetically', () => {
    expect(tickers(sortAssets([NVDA, MSFT, AAPL], 'ticker', 'asc'))).toEqual(['AAPL', 'MSFT', 'NVDA'])
  })

  it('does not mutate the input', () => {
    const input = [NVDA, AAPL]
    sortAssets(input, 'ticker', 'asc')

    expect(tickers(input)).toEqual(['NVDA', 'AAPL'])
  })
})

describe('searchAssets', () => {
  const all = [AAPL, MSFT, NVDA, META]

  it('returns nothing for an empty query', () => {
    expect(searchAssets(all, '  ')).toEqual([])
  })

  it('matches ticker case-insensitively', () => {
    expect(tickers(searchAssets(all, 'nvda'))).toEqual(['NVDA'])
  })

  it('matches token symbols', () => {
    expect(tickers(searchAssets(all, 'aaplon'))).toEqual(['AAPL'])
  })

  it('matches title substrings', () => {
    expect(tickers(searchAssets(all, 'platforms'))).toEqual(['META'])
  })

  it('ranks exact ticker matches above partial ones', () => {
    const MS = asset('MS', 'Morgan Stanley', 0, null)

    expect(tickers(searchAssets([MSFT, MS], 'ms'))).toEqual(['MS', 'MSFT'])
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5]

  it('returns the requested page', () => {
    expect(paginate(items, 2, 2)).toEqual({ items: [3, 4], totalPages: 3 })
  })

  it('returns an empty page beyond the end', () => {
    expect(paginate(items, 4, 2)).toEqual({ items: [], totalPages: 3 })
  })

  it('reports at least one page for an empty list', () => {
    expect(paginate([], 1, 20)).toEqual({ items: [], totalPages: 1 })
  })
})
