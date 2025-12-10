import { useMemo } from 'react'

import { BridgeQuoteAmounts } from '@cowprotocol/types'

import { useGetReceiveAmountInfo, useGetSwapReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

export function useBridgeQuoteAmounts(): BridgeQuoteAmounts | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const swapReceiveAmountInfo = useGetSwapReceiveAmountInfo()
  const { bridgeQuote } = useTradeQuote()

  return useMemo(() => {
    if (!receiveAmountInfo?.costs.bridgeFee || !bridgeQuote || !swapReceiveAmountInfo) return null

    const swapSellAmount = receiveAmountInfo.afterSlippage.sellAmount
    const swapBuyAmount = swapReceiveAmountInfo.afterNetworkCosts.buyAmount
    const swapMinReceiveAmount = swapReceiveAmountInfo.afterSlippage.buyAmount
    const bridgeMinReceiveAmount = receiveAmountInfo.afterSlippage.buyAmount

    return {
      swapSellAmount,
      swapBuyAmount,
      swapMinReceiveAmount,
      bridgeMinReceiveAmount,
      bridgeFee: receiveAmountInfo.costs.bridgeFee.amountInDestinationCurrency,
      bridgeFeeAmounts: receiveAmountInfo.costs.bridgeFee,
    }
  }, [receiveAmountInfo, swapReceiveAmountInfo, bridgeQuote])
}
