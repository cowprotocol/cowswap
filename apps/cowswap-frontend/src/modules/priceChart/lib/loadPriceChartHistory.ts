import { getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSupportedChain } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { fetchPriceHistory, fetchTokenSupply } from '../api'

import type { Candle, ChartMetric, CandleInterval, SupplyVariant } from './priceChart.types'

export async function loadMarketCapSupply(currency: Currency, supplyVariant: SupplyVariant): Promise<number> {
  const supplies = await fetchTokenSupply(currency)
  const supply = supplies[`${supplyVariant}Supply`]

  // TODO would be nice to use valibot or zod
  if (typeof supply !== 'number' || !Number.isFinite(supply) || supply <= 0) {
    throw new Error(`Token supplies unavailable`)
  }

  return supply
}

export async function loadPriceChartHistory(
  currency: Currency,
  from: number,
  to: number,
  interval: CandleInterval,
  metric: ChartMetric,
  supplyVariant: SupplyVariant,
): Promise<Candle[]> {
  const { chainId } = currency
  if (!isSupportedChain(chainId)) throw new Error(`Unsupported price chart chain: ${chainId}`)

  const address = getAddressKey(getWrappedToken(currency).address)
  const bars = await fetchPriceHistory({ address, chainId, from, interval, to })

  return metric === 'price' ? bars : toMarketCapBars(currency, bars, supplyVariant)
}

export async function toMarketCapBars(
  currency: Currency,
  bars: Candle[],
  supplyVariant: SupplyVariant,
): Promise<Candle[]> {
  if (!bars.length) return bars

  const supply = await loadMarketCapSupply(currency, supplyVariant)

  return bars.map((bar) => ({
    ...bar,
    close: bar.close * supply,
    high: bar.high * supply,
    low: bar.low * supply,
    open: bar.open * supply,
  }))
}
