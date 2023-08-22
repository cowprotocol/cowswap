import { Percent } from '@uniswap/sdk-core'

import { QuoteError } from 'legacy/state/price/actions'

export { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

export interface PriceImpact {
  priceImpact: Percent | undefined
  error: QuoteError | undefined
  loading: boolean
}
