import { Command } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

export type TotalSurplusState = {
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  isLoading: boolean
  error: string
  refetch: Command | null
}
