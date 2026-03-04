import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'

import { Nullish } from 'types'

export type TotalSurplusState = {
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  isLoading: boolean
  error: string
}
