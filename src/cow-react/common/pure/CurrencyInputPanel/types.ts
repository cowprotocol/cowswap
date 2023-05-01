import { Field } from 'state/swap/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ReceiveAmountInfo } from '@cow/modules/swap/helpers/tradeReceiveAmount'

export interface CurrencyInfo {
  label?: string
  field: Field
  currency: Currency | null
  rawAmount: CurrencyAmount<Currency> | null
  viewAmount: string // TODO: should be calculated in CurrencyInputPanel
  receiveAmountInfo: ReceiveAmountInfo | null
  balance: CurrencyAmount<Currency> | null
  fiatAmount: CurrencyAmount<Currency> | null
}
