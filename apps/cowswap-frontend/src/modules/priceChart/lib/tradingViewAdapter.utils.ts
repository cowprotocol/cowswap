import type { Bar, ResolutionString } from './charting_library'
import type {
  PriceChartBar,
  PriceChartCurrencyCode,
  PriceChartQueryParams,
  PriceChartResolution,
} from './priceChart.types'
import type {
  PriceChartCurrencyDescriptor,
  PriceChartResolvedPriceRequest,
  PriceChartSymbolDescriptor,
} from './tradingView.types'

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
  asset: PriceChartCurrencyDescriptor,
  currencyCode: PriceChartCurrencyCode,
  isFallback: boolean,
): PriceChartResolvedPriceRequest | null {
  const { address, chainId } = asset

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
    const usdRequest = buildResolvedPriceRequest(symbol.baseAsset, 'USD', false)

    return usdRequest ? [usdRequest] : []
  }

  if (symbol.quoteAsset.kind !== 'token') {
    return []
  }

  const baseUsdRequest = buildResolvedPriceRequest(symbol.baseAsset, 'USD', false)
  const quoteUsdRequest = buildResolvedPriceRequest(symbol.quoteAsset, 'USD', false)

  return [baseUsdRequest, quoteUsdRequest].filter(
    (request): request is PriceChartResolvedPriceRequest => request !== null,
  )
}

function getDerivedPairValue(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || numerator <= 0 || denominator <= 0) {
    return null
  }

  return numerator / denominator
}

export function derivePairBarsFromUsdBars(baseBars: PriceChartBar[], quoteBars: PriceChartBar[]): PriceChartBar[] {
  const quoteBarsByTime = new Map(quoteBars.map((bar) => [bar.time, bar]))

  return baseBars.reduce<PriceChartBar[]>((acc, baseBar) => {
    const quoteBar = quoteBarsByTime.get(baseBar.time)

    if (!quoteBar) {
      return acc
    }

    const open = getDerivedPairValue(baseBar.open, quoteBar.open)
    const high = getDerivedPairValue(baseBar.high, quoteBar.low)
    const low = getDerivedPairValue(baseBar.low, quoteBar.high)
    const close = getDerivedPairValue(baseBar.close, quoteBar.close)

    if (open === null || high === null || low === null || close === null) {
      return acc
    }

    acc.push({
      close,
      high: Math.max(high, low),
      low: Math.min(high, low),
      open,
      status: baseBar.status,
      time: baseBar.time,
      volume: undefined,
    })

    return acc
  }, [])
}

export function getReadyStatusMessage(
  symbol: PriceChartSymbolDescriptor,
  _request: PriceChartResolvedPriceRequest,
): string {
  return `Price history loaded for ${symbol.ticker}.`
}
