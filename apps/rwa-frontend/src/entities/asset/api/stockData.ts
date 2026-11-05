import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { RwaAsset, RwaCandle, RwaChartPoint, RwaChartRange, RwaStockMarket } from '../model/types'

/** Stock market data of the share behind an asset. Every method resolves to `null` when the provider has no data */
export interface StockDataProvider {
  name: string
  getMarket(asset: RwaAsset): Promise<RwaStockMarket | null>
  /** USD per share, oldest first */
  getChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[] | null>
  /** USD per share, oldest first */
  getCandles(asset: RwaAsset, range: RwaChartRange): Promise<RwaCandle[] | null>
}

/**
 * Asks `providers` in order and answers with the first one that has data. A provider that fails is skipped.
 * Rejects with the last failure when none has data and any failed, so an outage isn't reported as missing data
 */
export function withStockDataFallback(providers: StockDataProvider[]): StockDataProvider {
  return {
    name: providers.map(({ name }) => name).join(' → '),
    getMarket: (asset) => loadFromFirst(providers, (provider) => provider.getMarket(asset)),
    getChart: (asset, range) => loadFromFirst(providers, (provider) => provider.getChart(asset, range)),
    getCandles: (asset, range) => loadFromFirst(providers, (provider) => provider.getCandles(asset, range)),
  }
}

async function loadFromFirst<T>(
  providers: StockDataProvider[],
  load: (provider: StockDataProvider) => Promise<T | null>,
): Promise<T | null> {
  let failure: Error | null = null

  for (const provider of providers) {
    try {
      const value = await load(provider)

      if (value !== null) return value
    } catch (err: unknown) {
      const error = normalizeError(err)
      console.error(`[rwa] ${provider.name} stock data failed`, error)
      failure = error
    }
  }

  if (failure) throw failure

  return null
}
