import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteSwapContext } from '../types'

export function useQuoteSwapContext(): QuoteSwapContext | null {
  const { bridgeQuote } = useTradeQuote()

  const receiveAmountInfo = useReceiveAmountInfo()

  const quoteAmounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)
  const { value: swapMinReceiveAmountUsd } = useUsdAmount(quoteAmounts?.swapMinReceiveAmount)
  const { value: swapExpectedReceiveUsd } = useUsdAmount(quoteAmounts?.swapBuyAmount)

  const slippage = useTradeSlippage()

  const cowShedAddress = bridgeQuote?.bridgeCallDetails.preAuthorizedBridgingHook.recipient

  return useMemo(() => {
    if (!receiveAmountInfo || !quoteAmounts || !cowShedAddress) return null

    const { sellAmount } = receiveAmountInfo.afterSlippage
    const sellToken = sellAmount.currency

    const sourceChainId = sellToken.chainId as SupportedChainId
    const sourceChainData = getChainInfo(sourceChainId)

    return {
      chainName: sourceChainData.name,
      receiveAmountInfo,
      sellAmount: quoteAmounts.swapSellAmount,
      buyAmount: quoteAmounts.swapBuyAmount,
      slippage,
      recipient: cowShedAddress,
      minReceiveAmount: quoteAmounts.swapMinReceiveAmount,
      minReceiveUsdValue: swapMinReceiveAmountUsd,
      expectedReceiveUsdValue: swapExpectedReceiveUsd,
    }
  }, [receiveAmountInfo, quoteAmounts, slippage, cowShedAddress, swapMinReceiveAmountUsd, swapExpectedReceiveUsd])
}
