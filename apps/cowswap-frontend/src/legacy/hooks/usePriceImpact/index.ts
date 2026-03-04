import { Percent } from '@cowprotocol/common-entities'

export { useFiatValuePriceImpact } from './useFiatValuePriceImpact'

export interface PriceImpact {
  priceImpact: Percent | undefined
  loading: boolean
}
