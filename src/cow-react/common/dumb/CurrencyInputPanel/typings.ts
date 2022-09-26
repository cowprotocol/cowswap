import { Field } from 'state/swap/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ReceiveAmountInfo } from 'cow-react/swap/helpers/tradeReceiveAmount'

export interface CurrencyInfo {
  field: Field
  viewAmount: string
  rawAmount: CurrencyAmount<Currency> | null
  receiveAmountInfo: ReceiveAmountInfo | null
  currency: Currency | null
  balance: CurrencyAmount<Currency> | null
  fiatAmount: CurrencyAmount<Currency> | null
}
