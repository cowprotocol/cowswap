import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeQuoteAmounts } from 'modules/bridge'

export function calculateTargetAmountsForNotMinedTx(
  quoteAmounts: BridgeQuoteAmounts,
  receivedAmount?: CurrencyAmount<TokenWithLogo>
): { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> } {
  if (!receivedAmount) {
    return {
      sellAmount: quoteAmounts.swapMinReceiveAmount,
      buyAmount: quoteAmounts.bridgeMinReceiveAmount
    }
  }

  return {
    sellAmount: receivedAmount,
    buyAmount: estimateWalletMinReceived(receivedAmount, quoteAmounts.bridgeMinReceiveAmount)
  }
}

function estimateWalletMinReceived(
  receivedAmount: CurrencyAmount<TokenWithLogo>,
  bridgeMinReceiveAmount: CurrencyAmount<Currency>
): CurrencyAmount<Currency> {
  const koeff = receivedAmount.divide(bridgeMinReceiveAmount)
  return bridgeMinReceiveAmount.multiply(koeff)
}
