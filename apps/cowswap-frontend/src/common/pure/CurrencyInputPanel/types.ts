import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { ReceiveAmountInfo } from 'modules/swap/helpers/tradeReceiveAmount'

export interface CurrencyInfo {
  label?: string
  field: Field
  currency: Currency | null
  amount: CurrencyAmount<Currency> | null
  isIndependent: boolean
  receiveAmountInfo: ReceiveAmountInfo | null
  balance: CurrencyAmount<Currency> | null
  fiatAmount: CurrencyAmount<Currency> | null
}
