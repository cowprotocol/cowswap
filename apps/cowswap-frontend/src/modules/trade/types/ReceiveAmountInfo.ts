import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: CurrencyAmount<Currency> | undefined
  amountAfterFees: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency> | undefined
  partnerFeeAmount: CurrencyAmount<Currency> | undefined
}
