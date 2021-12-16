import { Percent } from '@uniswap/sdk-core'
import useFiatValuePriceImpact from './useFiatValuePriceImpact'
import useFallbackPriceImpact from './useFallbackPriceImpact'
import { FallbackPriceImpactParams, ParsedAmounts } from './types'
import { QuoteError } from 'state/price/actions'

type PriceImpactParams = Omit<FallbackPriceImpactParams, 'fiatPriceImpact'> & {
  parsedAmounts: ParsedAmounts
}

export interface PriceImpact {
  priceImpact: Percent | undefined
  error: QuoteError | undefined
  loading: boolean
}

export default function usePriceImpact({ abTrade, parsedAmounts, isWrapping }: PriceImpactParams): PriceImpact {
  const fiatPriceImpact = useFiatValuePriceImpact(parsedAmounts)
  const {
    impact: fallbackPriceImpact,
    error,
    loading,
  } = useFallbackPriceImpact({ abTrade: fiatPriceImpact ? undefined : abTrade, isWrapping })

  const priceImpact = fiatPriceImpact || fallbackPriceImpact

  return { priceImpact, error: fiatPriceImpact ? undefined : error, loading }
}
