import { Percent } from '@uniswap/sdk-core'
import useFiatValuePriceImpact from './useFiatValuePriceImpact'
import useFallbackPriceImpact from './useFallbackPriceImpact'
import { FallbackPriceImpactParams, ParsedAmounts } from './commonTypes'
import { QuoteError } from 'state/price/actions'

type PriceImpactParams = Omit<FallbackPriceImpactParams, 'fiatPriceImpact'> & { parsedAmounts: ParsedAmounts }

export interface PriceImpact {
  priceImpact: Percent | undefined
  error: QuoteError | undefined
  loading: boolean
}

export default function usePriceImpact({ abTrade, parsedAmounts }: PriceImpactParams): PriceImpact {
  /* const fiatPriceImpact =  */ useFiatValuePriceImpact(parsedAmounts)
  // TODO: remove this - testing only - forces fallback price impact
  const {
    impact: fallbackPriceImpact,
    error,
    loading,
  } = useFallbackPriceImpact({ abTrade, fiatPriceImpact: undefined })

  const priceImpact = /* fiatPriceImpact ||  */ fallbackPriceImpact

  // TODO: remove this - testing only - forces fallback
  return { priceImpact, error, loading }
}
