import { useMemo } from 'react'

import { BridgeQuoteAmounts } from '@cowprotocol/types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useGetReceiveAmountInfo, useGetSwapReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

export function useBridgeQuoteAmounts(): BridgeQuoteAmounts | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const swapReceiveAmountInfo = useGetSwapReceiveAmountInfo()
  const { bridgeQuote } = useTradeQuote()

  return useMemo(() => {
    if (!receiveAmountInfo?.costs.bridgeFee || !bridgeQuote || !swapReceiveAmountInfo) return null

    const { sellAmount: swapSellAmount, buyAmount: swapBuyAmount } = receiveAmountInfo.amountsToSign
    const swapExpectedReceive = swapReceiveAmountInfo.afterPartnerFees.buyAmount
    const swapMinReceiveAmount = swapReceiveAmountInfo.amountsToSign.buyAmount
    const bridgeMinReceiveAmount = CurrencyAmount.fromRawAmount(
      swapBuyAmount.currency,
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
