import type { Bar, ResolutionString } from './charting_library'
import type {
  PriceChartBar,
  PriceChartCurrencyCode,
  PriceChartQueryParams,
  PriceChartResolution,
} from './priceChart.types'
import type { PriceChartResolvedPriceRequest, PriceChartSymbolDescriptor } from './tradingView.types'

const RESOLUTION_TO_PRICE_CHART: Partial<Record<string, PriceChartResolution>> = {
  '1': '1',
  '5': '5',
  '15': '15',
  '60': '60',
  '240': '240',
  '1D': '1D',
  '1W': '7D',
}

function parseVolume(value: string | undefined): number | undefined {
  if (!value) return undefined

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

function buildResolvedPriceRequest(
  symbol: PriceChartSymbolDescriptor,
  currencyCode: PriceChartCurrencyCode,
  isFallback: boolean,
): PriceChartResolvedPriceRequest | null {
  const { address, chainId } = symbol.baseAsset

  if (!address || chainId === undefined) {
    return null
  }

  return {
    address,
    chainId,
    currencyCode,
    isFallback,
  }
}

export function mapResolutionToPriceChartResolution(resolution: ResolutionString): PriceChartResolution | null {
  return RESOLUTION_TO_PRICE_CHART[String(resolution)] || null
}

export function mapPriceChartBarsToTradingViewBars(bars: PriceChartBar[]): Bar[] {
  return bars.map((bar) => ({
    close: bar.close,
    high: bar.high,
    low: bar.low,
    open: bar.open,
    time: bar.time * 1000,
    volume: parseVolume(bar.volume),
  }))
}

export function buildPriceChartQueryParams(
  symbol: PriceChartSymbolDescriptor,
  request: PriceChartResolvedPriceRequest,
  from: number,
  to: number,
  resolution: PriceChartResolution,
  countback: number | undefined,
): PriceChartQueryParams {
  return {
    address: request.address,
    chainId: request.chainId,
    countback,
    currencyCode: request.currencyCode,
    from,
    removeEmptyBars: true,
    removeLeadingNullValues: true,
    resolution,
    to,
  }
}

export function getResolvedPriceRequests(symbol: PriceChartSymbolDescriptor): PriceChartResolvedPriceRequest[] {
  if (symbol.quoteAsset.kind === 'usd') {
    const request = buildResolvedPriceRequest(symbol, 'USD', false)

    return request ? [request] : []
  }

  const requests = [buildResolvedPriceRequest(symbol, 'TOKEN', false), buildResolvedPriceRequest(symbol, 'USD', true)]

  return requests.filter((request): request is PriceChartResolvedPriceRequest => Boolean(request))
}

export function getReadyStatusMessage(
  symbol: PriceChartSymbolDescriptor,
  request: PriceChartResolvedPriceRequest,
): string {
  if (request.isFallback) {
    return `Direct ${symbol.ticker} history unavailable. Showing ${symbol.baseAsset.symbol}USD from Codex.`
  }

  if (request.currencyCode === 'USD') {
    return `Codex history loaded for ${symbol.ticker}.`
  }

  return `Codex token-quoted history loaded for ${symbol.ticker}.`
}
