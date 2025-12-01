import { useMemo } from 'react'

import { useTryFindToken } from '@cowprotocol/tokens'
import { BridgeQuoteAmounts } from '@cowprotocol/types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

export function useBridgeQuoteAmounts(): BridgeQuoteAmounts | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { bridgeQuote } = useTradeQuote()
  const intermediateBuyToken = useTryFindToken(getBridgeIntermediateTokenAddress(bridgeQuote))?.token

  return useMemo(() => {
    if (!receiveAmountInfo?.costs.bridgeFee || !bridgeQuote) return null

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

    return {
      swapSellAmount,
      swapBuyAmount,
      swapMinReceiveAmount,
      bridgeMinReceiveAmount,
      bridgeFee: receiveAmountInfo.costs.bridgeFee.amountInDestinationCurrency,
      bridgeFeeAmounts: receiveAmountInfo.costs.bridgeFee,
    }
  }, [receiveAmountInfo, bridgeQuote, intermediateBuyToken])
}
