import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { PriceChartBar, PriceChartMetric, PriceChartResolution } from './priceChart.types'
import type { PriceChartSymbolDescriptor } from './tradingView.types'

export async function loadPriceChartHistory(
  symbol: PriceChartSymbolDescriptor,
  from: number,
  to: number,
  resolution: PriceChartResolution,
  metric: PriceChartMetric,
  countback?: number,
): Promise<PriceChartBar[]> {
  const { address, chainId } = symbol.baseAsset
  const bars = await fetchPriceChartData({ address, chainId, countback, from, resolution, to })

  return metric === 'price' ? bars : toMarketCapBars(symbol, bars)
}

export async function toMarketCapBars(
  symbol: PriceChartSymbolDescriptor,
  bars: PriceChartBar[],
): Promise<PriceChartBar[]> {
  if (!bars.length) return bars

  const { circulatingSupply } = await fetchTokenSupply(symbol.baseAsset)

  if (typeof circulatingSupply !== 'number' || !Number.isFinite(circulatingSupply) || circulatingSupply <= 0) {
    throw new Error('Circulating supply unavailable')
  }

  return bars.map((bar) => ({
    ...bar,
    close: bar.close * circulatingSupply,
    high: bar.high * circulatingSupply,
    low: bar.low * circulatingSupply,
    open: bar.open * circulatingSupply,
  }))
}
