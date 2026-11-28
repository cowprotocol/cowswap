import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount, Price } from '@cowprotocol/currency'

export interface BridgeEstimatedAmounts {
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
  /** Converts the intermediate currency into the destination currency */
  bridgePrice: Price<Currency, Currency>
}
