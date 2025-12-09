import { useMemo } from 'react'

import { useTryFindToken } from '@cowprotocol/tokens'

import { useTradeQuote } from 'modules/tradeQuote'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useSwapReceiveAmountInfoParams } from './useGetSwapReceiveAmountInfo'

import { ReceiveAmountInfo } from '../types'
import { getCrossChainReceiveAmountInfo } from '../utils/getCrossChainReceiveAmountInfo'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { inputCurrency, outputCurrency } = useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const { bridgeQuote } = tradeQuote
  const bridgeFeeAmounts = bridgeQuote?.amountsAndCosts.costs.bridgingFee
  const bridgeBuyAmount = bridgeQuote?.amountsAndCosts.beforeFee.buyAmount

  const params = useSwapReceiveAmountInfoParams()
  const intermediateCurrency = useTryFindToken(getBridgeIntermediateTokenAddress(bridgeQuote))?.token ?? undefined

  return useMemo(() => {
    if (!params || !inputCurrency || !outputCurrency) return null

    if (intermediateCurrency && bridgeFeeAmounts && bridgeBuyAmount) {
      return getCrossChainReceiveAmountInfo({
        ...params,
        // Important! Override currencies in case of cross-chain swap
        inputCurrency,
        outputCurrency,
        intermediateCurrency,
        bridgeFeeAmounts,
        bridgeBuyAmount,
      })
    }

    return getReceiveAmountInfo(params)
  }, [params, inputCurrency, outputCurrency, intermediateCurrency, bridgeFeeAmounts, bridgeBuyAmount])
}
