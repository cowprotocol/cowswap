import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { useFreezeWhileConfirming } from 'modules/trade'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'

import { SwapAmountDifference, useSwapAmountDifference } from './useSwapAmountDifference'

export interface SwapPriceDifferenceWarningValues {
  swapAmountDifference: SwapAmountDifference | null
  feeFiatAmount: CurrencyAmount<Token> | null
}

/**
 * Both values are quote-derived and rendered by `SwapPriceDifferenceWarning`, which the TWAP
 * confirm modal shows next to amounts it has already frozen. They are frozen here as one snapshot
 * so a quote refresh landing while the wallet prompt is open can neither leave the warning
 * contradicting the amounts above it, nor pair a fresh fee with a stale difference.
 */
export function useSwapPriceDifferenceWarningProps(): SwapPriceDifferenceWarningValues {
  const swapAmountDifference = useSwapAmountDifference()
  const feeFiatAmount = useTradeQuoteFeeFiatAmount()

  return useFreezeWhileConfirming({ swapAmountDifference, feeFiatAmount })
}
