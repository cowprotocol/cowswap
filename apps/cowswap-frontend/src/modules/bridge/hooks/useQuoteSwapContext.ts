import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useCurrentAccountProxy } from 'modules/accountProxy'
import { useGetSwapReceiveAmountInfo } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT, useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteSwapContext } from '../types'

export function useQuoteSwapContext(): QuoteSwapContext | null {
  const receiveAmountInfo = useGetSwapReceiveAmountInfo()

  const quoteAmounts = useBridgeQuoteAmounts()
  const { value: swapMinReceiveAmountUsd } = useUsdAmount(quoteAmounts?.swapMinReceiveAmount)
  const { value: swapExpectedReceiveUsd } = useUsdAmount(quoteAmounts?.swapExpectedReceive)

  const slippage = useTradeSlippage()
  const { bridgeQuote } = useTradeQuote()
  const isSlippageModified = useIsSlippageModified()

  const cowShedAddress = useCurrentAccountProxy()?.data?.proxyAddress
  const bridgeReceiverOverride = bridgeQuote?.bridgeReceiverOverride || null
  const recipient = bridgeReceiverOverride || cowShedAddress || BRIDGE_QUOTE_ACCOUNT

  return useMemo(() => {
    if (!receiveAmountInfo || !quoteAmounts || !recipient) return null

    const { sellAmount } = receiveAmountInfo.afterSlippage
    const sellToken = sellAmount.currency

    const sourceChainId = sellToken.chainId as SupportedChainId
    const sourceChainData = getChainInfo(sourceChainId)

    return {
      chainName: sourceChainData.label,
      receiveAmountInfo,
      sellAmount: quoteAmounts.swapSellAmount,
      buyAmount: quoteAmounts.swapBuyAmount,
      slippage,
      isSlippageModified,
      recipient,
      bridgeReceiverOverride,
      expectedReceive: quoteAmounts.swapExpectedReceive,
      minReceiveAmount: quoteAmounts.swapMinReceiveAmount,
      minReceiveUsdValue: swapMinReceiveAmountUsd,
      expectedReceiveUsdValue: swapExpectedReceiveUsd,
    }
  }, [
    receiveAmountInfo,
    quoteAmounts,
    slippage,
    isSlippageModified,
    recipient,
    swapMinReceiveAmountUsd,
    swapExpectedReceiveUsd,
    bridgeReceiverOverride,
  ])
}
