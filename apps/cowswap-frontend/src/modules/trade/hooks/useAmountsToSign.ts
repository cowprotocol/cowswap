import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useReceiveAmountInfo } from './useReceiveAmountInfo'

export interface AmountsToSign {
  maximumSendSellAmount: CurrencyAmount<Currency>
  minimumReceiveBuyAmount: CurrencyAmount<Currency>
}

/**
 * Returns amounts that will end up in signed order
 * It means, those values already include fees and slippage depending on order type
 */
export function useAmountsToSign(): AmountsToSign | null {
  const { isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount } = useDerivedTradeState() || {}
  const { afterSlippage } = useReceiveAmountInfo() || {}

  return useMemo(() => {
    const maximumSendSellAmount = isQuoteBasedOrder ? afterSlippage?.sellAmount : inputCurrencyAmount
    const minimumReceiveBuyAmount = isQuoteBasedOrder ? afterSlippage?.buyAmount : outputCurrencyAmount

    if (!maximumSendSellAmount || !minimumReceiveBuyAmount) return null

    return { maximumSendSellAmount, minimumReceiveBuyAmount }
  }, [isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount, afterSlippage])
}
