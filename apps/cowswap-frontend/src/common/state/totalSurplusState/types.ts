import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

export type TotalSurplusState = {
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  isLoading: boolean
  error: string
}
