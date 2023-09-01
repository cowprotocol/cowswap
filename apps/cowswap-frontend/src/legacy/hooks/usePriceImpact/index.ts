import { Percent } from '@uniswap/sdk-core'

export { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

export interface PriceImpact {
  priceImpact: Percent | undefined
  loading: boolean
}
