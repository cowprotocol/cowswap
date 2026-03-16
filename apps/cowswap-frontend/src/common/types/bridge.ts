import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

export interface BridgeEstimatedAmounts {
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
}
