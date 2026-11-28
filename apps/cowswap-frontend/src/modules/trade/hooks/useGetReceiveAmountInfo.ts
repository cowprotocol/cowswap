import { useMemo } from 'react'

import { CurrencyAmount } from '@cowprotocol/currency'

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
  const { bridgePrice, intermediateCurrency } = useEstimatedBridgeBuyAmount() || {}

  return useMemo(() => {
    if (!params || !inputCurrency || !outputCurrency) return null

    if (intermediateCurrency && bridgeFeeAmounts && bridgePrice) {
      // Replaces orderParams.buyAmount, from which getCrossChainReceiveAmountInfo() deducts the partner fee,
      // so it must be bridged from the same pre-partner-fee amount
      const expectedToReceiveAmount = bridgePrice.quote(
        CurrencyAmount.fromRawAmount(intermediateCurrency, params.orderParams.buyAmount),
      )

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
  }, [params, inputCurrency, outputCurrency, intermediateCurrency, bridgeFeeAmounts, bridgePrice])
}
