import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { BridgeQuoteAmounts } from '../types/bridge'

export function calculateTargetAmountsBeforeBridging(
  quoteAmounts: BridgeQuoteAmounts,
  receivedAmount?: CurrencyAmount<TokenWithLogo>,
): { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> } {
  if (!receivedAmount) {
    return {
      sellAmount: quoteAmounts.swapMinReceiveAmount,
      buyAmount: quoteAmounts.bridgeMinReceiveAmount,
    }
  }

  return {
    sellAmount: receivedAmount,
    buyAmount: estimateWalletMinReceived(receivedAmount, quoteAmounts.bridgeMinReceiveAmount),
  }
}

function estimateWalletMinReceived(
  receivedAmount: CurrencyAmount<TokenWithLogo>,
  bridgeMinReceiveAmount: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> {
  const koeff = new Price(
    receivedAmount.currency,
    bridgeMinReceiveAmount.currency,
    receivedAmount.quotient,
    bridgeMinReceiveAmount.quotient,
  )
  return bridgeMinReceiveAmount.multiply(koeff)
}
