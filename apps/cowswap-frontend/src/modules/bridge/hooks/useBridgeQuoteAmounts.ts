import { useMemo } from 'react'

import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from 'modules/trade'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount
  bridgeMinReceiveAmount: Amount
  bridgeFee: Amount
}

export function useBridgeQuoteAmounts(
  receiveAmountInfo: ReceiveAmountInfo | null,
  bridgeQuote: BridgeQuoteResults | null,
): BridgeQuoteAmounts | null {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!receiveAmountInfo || !bridgeQuote) return null

    const { sellAmount: swapSellAmount, buyAmount } = receiveAmountInfo.afterSlippage
    const buyToken = buyAmount.currency

    const intermediateBuyTokenAddress = bridgeQuote.tradeParameters.sellTokenAddress
    const intermediateBuyToken = tokensByAddress[intermediateBuyTokenAddress.toLowerCase()]

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
  }, [receiveAmountInfo, bridgeQuote, tokensByAddress])
}
