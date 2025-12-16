import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeEstimatedAmounts {
  sellAmount: CurrencyAmount<Currency>
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
}
