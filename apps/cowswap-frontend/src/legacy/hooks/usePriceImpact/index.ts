import { Percent } from '@cowprotocol/currency'

export { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

export interface PriceImpact {
  priceImpact: Percent | undefined
  loading: boolean
}
