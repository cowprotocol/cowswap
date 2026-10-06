import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { Candle, ChartMetric, CandleInterval, SupplyVariant, ChartAsset } from './chart.types'

export async function loadMarketCapSupply(asset: ChartAsset, supplyVariant: SupplyVariant): Promise<number> {
  const supplies = await fetchTokenSupply(asset)
  const supply = supplies[`${supplyVariant}Supply`]

  // TODO would be nice to use valibot or zod
  if (typeof supply !== 'number' || !Number.isFinite(supply) || supply <= 0) {
    throw new Error(`Token supplies unavailable`)
  }

  return supply
}

export async function loadPriceChartHistory(
  asset: ChartAsset,
  from: number,
  to: number,
  interval: CandleInterval,
  metric: ChartMetric,
  supplyVariant: SupplyVariant,
): Promise<Candle[]> {
  const { address, chainId } = asset
  const bars = await fetchPriceChartData({ address, chainId, from, interval, to })

  return metric === 'price' ? bars : toMarketCapBars(asset, bars, supplyVariant)
}

export async function toMarketCapBars(
  asset: ChartAsset,
  bars: Candle[],
  supplyVariant: SupplyVariant,
): Promise<Candle[]> {
  if (!bars.length) return bars

  const supply = await loadMarketCapSupply(asset, supplyVariant)

  return bars.map((bar) => ({
    ...bar,
    close: bar.close * supply,
    high: bar.high * supply,
    low: bar.low * supply,
    open: bar.open * supply,
  }))
}
