import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { PriceChartBar, PriceChartMetric, PriceChartResolution, PriceChartSupplyBasis } from './priceChart.types'
import type { PriceChartAssetDescriptor, PriceChartSymbolDescriptor } from './tradingView.types'

export async function loadMarketCapSupply(
  asset: PriceChartAssetDescriptor,
  supplyBasis: PriceChartSupplyBasis = 'circulating',
): Promise<number> {
  const supply = (await fetchTokenSupply(asset))[`${supplyBasis}Supply`]

  if (typeof supply !== 'number' || !Number.isFinite(supply) || supply <= 0) {
    throw new Error(`${supplyBasis === 'total' ? 'Total' : 'Circulating'} supply unavailable`)
  }

  return supply
}

export async function loadPriceChartHistory(
  symbol: PriceChartSymbolDescriptor,
  from: number,
  to: number,
  resolution: PriceChartResolution,
  metric: PriceChartMetric,
  supplyBasis: PriceChartSupplyBasis = 'circulating',
  countback?: number,
): Promise<PriceChartBar[]> {
  const { address, chainId } = symbol.baseAsset
  const bars = await fetchPriceChartData({ address, chainId, countback, from, resolution, to })

  return metric === 'price' ? bars : toMarketCapBars(symbol, bars, supplyBasis)
}

export async function toMarketCapBars(
  symbol: PriceChartSymbolDescriptor,
  bars: PriceChartBar[],
  supplyBasis: PriceChartSupplyBasis = 'circulating',
): Promise<PriceChartBar[]> {
  if (!bars.length) return bars

  const supply = await loadMarketCapSupply(symbol.baseAsset, supplyBasis)

  return bars.map((bar) => ({
    ...bar,
    close: bar.close * supply,
    high: bar.high * supply,
    low: bar.low * supply,
    open: bar.open * supply,
  }))
}
