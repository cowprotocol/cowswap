/**
 * @jest-environment node
 */
import { type StockDataProvider, withStockDataFallback } from './stockData'

import type { RwaAsset, RwaStockMarket } from '../model/types'

const ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 0,
  tokens: [],
}

function market(provider: string): RwaStockMarket {
  return {
    price: 200,
    change24h: null,
    dayLow: null,
    dayHigh: null,
    yearLow: null,
    yearHigh: null,
    marketCap: null,
    volume24h: null,
    updatedAt: '2026-11-05T12:00:00.000Z',
    provider,
  }
}

function provider(name: string, getMarket: StockDataProvider['getMarket']): StockDataProvider {
  return { name, getMarket, getChart: async () => null, getCandles: async () => null }
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('withStockDataFallback', () => {
  it('answers with the first provider that has data, without asking the next ones', async () => {
    const third = jest.fn(async () => market('third'))
    const stockData = withStockDataFallback([
      provider('first', async () => null),
      provider('second', async () => market('second')),
      provider('third', third),
    ])

    expect(await stockData.getMarket(ASSET)).toEqual(market('second'))
    expect(third).not.toHaveBeenCalled()
  })

  it('skips a provider that fails', async () => {
    const stockData = withStockDataFallback([
      provider('first', () => Promise.reject(new Error('Ondo responded with 429'))),
      provider('second', async () => market('second')),
    ])

    expect(await stockData.getMarket(ASSET)).toEqual(market('second'))
  })

  it('is null when no provider covers the asset', async () => {
    const stockData = withStockDataFallback([provider('first', async () => null), provider('second', async () => null)])

    expect(await stockData.getMarket(ASSET)).toBeNull()
  })

  it('rejects when no provider has data and one failed, so an outage is not reported as missing data', async () => {
    const stockData = withStockDataFallback([
      provider('first', () => Promise.reject(new Error('Ondo responded with 503'))),
      provider('second', async () => null),
    ])

    await expect(stockData.getMarket(ASSET)).rejects.toThrow('Ondo responded with 503')
  })
})
