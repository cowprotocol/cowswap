import { useMemo } from 'react'

import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from 'modules/trade'

import { useGetMaybeIntermediateToken } from './useGetMaybeIntermediateToken'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount // that should be moved on bridge (before sending to user)
  bridgeMinReceiveAmount: Amount // that should be moved to user
  bridgeFee: Amount
}

export function useBridgeQuoteAmounts(
  receiveAmountInfo: ReceiveAmountInfo | null,
  bridgeQuote: BridgeQuoteResults | null,
): BridgeQuoteAmounts | null {
  const { intermediateBuyToken } = useGetMaybeIntermediateToken({ bridgeQuote })

  return useMemo(() => {
    if (!receiveAmountInfo || !bridgeQuote) return null

    const { sellAmount: swapSellAmount, buyAmount } = receiveAmountInfo.afterSlippage
    const buyToken = buyAmount.currency

    if (!intermediateBuyToken) return null

    const swapBuyAmount = CurrencyAmount.fromRawAmount(
      intermediateBuyToken,
      receiveAmountInfo.afterNetworkCosts.buyAmount.quotient.toString(),
    )

    const swapMinReceiveAmount = CurrencyAmount.fromRawAmount(
      intermediateBuyToken,
      receiveAmountInfo.afterSlippage.buyAmount.quotient.toString(),
    )

    const bridgeMinReceiveAmount = CurrencyAmount.fromRawAmount(
      buyToken,
      bridgeQuote.amountsAndCosts.afterSlippage.buyAmount.toString(),
    )
    const bridgeFee = CurrencyAmount.fromRawAmount(
      buyToken,
      bridgeQuote.amountsAndCosts.costs.bridgingFee.amountInSellCurrency.toString(),
    )

    return {
      swapSellAmount,
      swapBuyAmount,
      swapMinReceiveAmount,
      bridgeMinReceiveAmount,
      bridgeFee,
    }
  }, [receiveAmountInfo, bridgeQuote, intermediateBuyToken])
}
