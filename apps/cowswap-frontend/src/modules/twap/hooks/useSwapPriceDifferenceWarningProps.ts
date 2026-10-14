import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { useFreezeWhileConfirming } from 'modules/trade'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'

import { SwapAmountDifference, useSwapAmountDifference } from './useSwapAmountDifference'

export interface SwapPriceDifferenceWarningValues {
  swapAmountDifference: SwapAmountDifference | null
  feeFiatAmount: CurrencyAmount<Token> | null
}

export function useSwapPriceDifferenceWarningProps(): SwapPriceDifferenceWarningValues {
  const swapAmountDifference = useSwapAmountDifference()
  const feeFiatAmount = useTradeQuoteFeeFiatAmount()

  const values = useMemo(() => ({ swapAmountDifference, feeFiatAmount }), [swapAmountDifference, feeFiatAmount])

  return useFreezeWhileConfirming(values)
}
