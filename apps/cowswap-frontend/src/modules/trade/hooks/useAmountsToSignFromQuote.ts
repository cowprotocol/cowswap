import { useMemo } from 'react'

import { currencyAmountToTokenAmount, FractionUtils } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'
import { useIsSafeEthFlow } from './useIsSafeEthFlow'

import { TradeType } from '../types'

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
  const { isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount, tradeType } = useDerivedTradeState() || {}
  const { isSell, afterSlippage } = useGetReceiveAmountInfo() || {}
  const isSafeBundleEth = useIsSafeEthFlow()

  return useMemo(() => {
    const sellAmountAfterSlippage = isQuoteBasedOrder ? afterSlippage?.sellAmount : inputCurrencyAmount
    const minimumReceiveBuyAmount = isQuoteBasedOrder ? afterSlippage?.buyAmount : outputCurrencyAmount

    if (!sellAmountAfterSlippage || !minimumReceiveBuyAmount) return null

    // Add 1% threshold for buy orders to level out price/gas fluctuations
    const maximumSendSellAmount = isSell
      ? sellAmountAfterSlippage
      : sellAmountForBuyOrder(sellAmountAfterSlippage, tradeType)

    return {
      // Safe ETH bundling uses ETH wrapping, so we should consider WETH as approving token
      maximumSendSellAmount: isSafeBundleEth
        ? currencyAmountToTokenAmount(maximumSendSellAmount)
        : maximumSendSellAmount,
      minimumReceiveBuyAmount,
    }
  }, [isSell, isSafeBundleEth, isQuoteBasedOrder, inputCurrencyAmount, outputCurrencyAmount, afterSlippage, tradeType])
}

function sellAmountForBuyOrder(
  sellAmount: CurrencyAmount<Currency>,
  tradeType: Nullish<TradeType>,
): CurrencyAmount<Currency> {
  return tradeType === TradeType.SWAP
    ? FractionUtils.addPercent(sellAmount, BUY_ORDER_APPROVE_AMOUNT_THRESHOLD)
    : sellAmount
}
