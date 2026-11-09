import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { assetYearChartQueryAtomFamily } from './assetChartQueryAtomFamily'
import { shownMarketKindAtomFamily } from './marketKindAtom'
import { useAssetMarket } from './useAssetMarket'

import { getYearRange, type YearRange } from '../lib/yearRange'

import {
  assetStockQueryAtomFamily,
  type RwaMarketData,
  type RwaMarketKind,
  type RwaStockMarket,
} from '@/entities/asset'

export type AssetPriceStats = Pick<
  RwaMarketData,
  'price' | 'change24h' | 'dayLow' | 'dayHigh' | 'marketCap' | 'volume24h'
>

interface ShownPriceStats {
  marketKind: RwaMarketKind
  /** `undefined` while loading, `null` without data */
  stats: AssetPriceStats | null | undefined
  yearRange: YearRange | null
  /** Where the shown market data comes from, `null` while unknown */
  provider: string | null
}

/** Price stats of the market shown on the asset page, the stock or the tokenized one */
export function useAssetPriceStats(ticker: string): ShownPriceStats {
  const marketKind = useAtomValue(shownMarketKindAtomFamily(ticker))
  const { market } = useAssetMarket(ticker)
  const stock = useAtomValue(assetStockQueryAtomFamily(ticker)).data?.market
  const yearPoints = useAtomValue(assetYearChartQueryAtomFamily(ticker)).data?.points
  const chartYearRange = useMemo(() => (yearPoints ? getYearRange(yearPoints) : null), [yearPoints])

  if (marketKind === 'tokenized') {
    return { marketKind, stats: market, yearRange: chartYearRange, provider: 'CoinGecko' }
  }

  if (!stock) return { marketKind, stats: stock, yearRange: chartYearRange, provider: null }

  return {
    marketKind,
    stats: stock,
    yearRange: getStockYearRange(stock) ?? chartYearRange,
    provider: stock.provider,
  }
}

function getStockYearRange({ yearLow, yearHigh }: RwaStockMarket): YearRange | null {
  return yearLow !== null && yearHigh !== null ? { low: yearLow, high: yearHigh, since: null } : null
}
