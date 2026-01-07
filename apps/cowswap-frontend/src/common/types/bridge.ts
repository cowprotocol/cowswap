import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeEstimatedAmounts {
  expectedToReceiveAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  minToReceiveAmount: CurrencyAmount<Currency>
  intermediateCurrency: TokenWithLogo
}
