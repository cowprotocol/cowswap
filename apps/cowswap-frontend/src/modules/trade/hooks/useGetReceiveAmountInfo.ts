import { useMemo } from 'react'

import { useTradeQuote } from 'modules/tradeQuote'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useEstimatedBridgeBuyAmount } from './useEstimatedBridgeBuyAmount'
import { useSwapReceiveAmountInfoParams } from './useGetSwapReceiveAmountInfo'

import { ReceiveAmountInfo } from '../types'
import { getCrossChainReceiveAmountInfo } from '../utils/getCrossChainReceiveAmountInfo'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { inputCurrency, outputCurrency } = useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const { bridgeQuote } = tradeQuote

  const bridgeFeeAmounts = bridgeQuote?.amountsAndCosts.costs.bridgingFee

  const params = useSwapReceiveAmountInfoParams()
  const { expectedToReceiveAmount, intermediateCurrency } = useEstimatedBridgeBuyAmount() || {}

  return useMemo(() => {
    if (!params || !inputCurrency || !outputCurrency) return null

    if (intermediateCurrency && bridgeFeeAmounts && expectedToReceiveAmount) {
      return getCrossChainReceiveAmountInfo({
        ...params,
        // Important! Override currencies in case of cross-chain swap
        inputCurrency,
        outputCurrency,
        intermediateCurrency,
        bridgeFeeAmounts,
        expectedToReceiveAmount,
      })
    }

    return getReceiveAmountInfo(params)
  }, [params, inputCurrency, outputCurrency, intermediateCurrency, bridgeFeeAmounts, expectedToReceiveAmount])
}
