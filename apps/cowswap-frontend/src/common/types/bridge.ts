import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'

export interface BridgeEstimatedAmounts {
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
}
