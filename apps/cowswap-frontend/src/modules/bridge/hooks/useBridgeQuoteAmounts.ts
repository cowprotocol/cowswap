import { useMemo } from 'react'

import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from 'modules/trade'

export function useBridgeQuoteAmounts(receiveAmountInfo: ReceiveAmountInfo, bridgeQuote: BridgeQuoteResults) {
  const tokensByAddress = useTokensByAddressMap()

  const { sellAmount: swapSellAmount, buyAmount } = receiveAmountInfo.afterSlippage
  const buyToken = buyAmount.currency

  const intermediateBuyTokenAddress = bridgeQuote.tradeParameters.sellTokenAddress
  const intermediateBuyToken = tokensByAddress[intermediateBuyTokenAddress.toLowerCase()]!

  return useMemo(() => {
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
  }, [receiveAmountInfo, bridgeQuote, swapSellAmount, buyToken, intermediateBuyToken])
}
