import { useMemo } from 'react'

import { CurrencyAmount } from '@cowprotocol/common-entities'
import { BridgeQuoteAmounts } from '@cowprotocol/types'

import { useGetReceiveAmountInfo, useGetSwapReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

export function useBridgeQuoteAmounts(): BridgeQuoteAmounts | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const swapReceiveAmountInfo = useGetSwapReceiveAmountInfo()
  const { bridgeQuote } = useTradeQuote()

  return useMemo(() => {
    if (!receiveAmountInfo?.costs.bridgeFee || !bridgeQuote || !swapReceiveAmountInfo) return null

    const { sellAmount: swapSellAmount } = receiveAmountInfo.amountsToSign

    const swapBuyAmount = swapReceiveAmountInfo.beforeAllFees.buyAmount
    const swapExpectedReceive = swapReceiveAmountInfo.afterPartnerFees.buyAmount
    const swapMinReceiveAmount = swapReceiveAmountInfo.amountsToSign.buyAmount
    const bridgeMinReceiveAmount = CurrencyAmount.fromRawAmount(
      receiveAmountInfo.amountsToSign.buyAmount.currency,
      bridgeQuote.amountsAndCosts.afterSlippage.buyAmount.toString(),
    )

    return {
      swapSellAmount,
      swapBuyAmount,
      swapExpectedReceive,
      swapMinReceiveAmount,
      bridgeMinReceiveAmount,
      bridgeFee: receiveAmountInfo.costs.bridgeFee.amountInDestinationCurrency,
      bridgeFeeAmounts: receiveAmountInfo.costs.bridgeFee,
    }
  }, [receiveAmountInfo, swapReceiveAmountInfo, bridgeQuote])
}
