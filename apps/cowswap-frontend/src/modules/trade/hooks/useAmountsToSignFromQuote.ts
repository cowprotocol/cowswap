import { useMemo } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'

const BUY_ORDER_APPROVE_AMOUNT_THRESHOLD = new Percent(1, 100) // 1%

export interface AmountsToSign {
  maximumSendSellAmount: CurrencyAmount<Currency>
  minimumReceiveBuyAmount: CurrencyAmount<Currency>
}

/**
 * Returns amounts that will end up in signed order
 * It means, those values already include fees and slippage depending on order type
 */
export function useAmountsToSignFromQuote(): AmountsToSign | null {
  const { isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount } = useDerivedTradeState() || {}
  const { isSell, afterSlippage } = useGetReceiveAmountInfo() || {}

  return useMemo(() => {
    const maximumSendSellAmount = isQuoteBasedOrder ? afterSlippage?.sellAmount : inputCurrencyAmount
    const minimumReceiveBuyAmount = isQuoteBasedOrder ? afterSlippage?.buyAmount : outputCurrencyAmount

    if (!maximumSendSellAmount || !minimumReceiveBuyAmount) return null

    return {
      // Add 1% threshold for buy orders to level out price/gas fluctuations
      maximumSendSellAmount: isSell
        ? maximumSendSellAmount
        : FractionUtils.addPercent(maximumSendSellAmount, BUY_ORDER_APPROVE_AMOUNT_THRESHOLD),
      minimumReceiveBuyAmount,
    }
  }, [isSell, isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount, afterSlippage])
}
