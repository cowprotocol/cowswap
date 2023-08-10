import { Percent } from '@uniswap/sdk-core'

import { QuoteError } from 'legacy/state/price/actions'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { getAddress } from 'utils/getAddress'

import { ParsedAmounts, PriceImpactTrade } from './types'
import useFallbackPriceImpact from './useFallbackPriceImpact'
import useFiatValuePriceImpact from './useFiatValuePriceImpact'

export interface PriceImpactParams {
  abTrade?: PriceImpactTrade
  isWrapping: boolean
  parsedAmounts: ParsedAmounts
}

export interface PriceImpact {
  priceImpact: Percent | undefined
  error: QuoteError | undefined
  loading: boolean
}

/**
 * Warning!
 * The hook cannot be used more the once in the same page
 */
export function usePriceImpact({ abTrade, parsedAmounts, isWrapping }: PriceImpactParams): PriceImpact {
  const { priceImpact: fiatPriceImpact, isLoading: isFiatLoading } = useFiatValuePriceImpact(parsedAmounts)
  const {
    impact: fallbackPriceImpact,
    error,
    loading: isFallbackLoading,
  } = useFallbackPriceImpact({
    sellToken: getAddress(parsedAmounts.INPUT?.currency),
    buyToken: getAddress(parsedAmounts.OUTPUT?.currency),
    abTrade: fiatPriceImpact ? undefined : abTrade,
    isWrapping,
  })

  const priceImpact = fiatPriceImpact || fallbackPriceImpact
  const loading = isFiatLoading || isFallbackLoading
  const _error = fiatPriceImpact ? undefined : error

  return useSafeMemo(() => ({ priceImpact, error: _error, loading }), [priceImpact, _error, loading])
}
