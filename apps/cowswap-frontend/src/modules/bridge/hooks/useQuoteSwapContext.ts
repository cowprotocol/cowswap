import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useCurrentAccountProxy } from 'modules/cowShed'
import { useGetReceiveAmountInfo } from 'modules/trade/hooks/useGetReceiveAmountInfo'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteSwapContext } from '../types'

export function useQuoteSwapContext(): QuoteSwapContext | null {
  const receiveAmountInfo = useGetReceiveAmountInfo()

  const quoteAmounts = useBridgeQuoteAmounts()
  const { value: swapMinReceiveAmountUsd } = useUsdAmount(quoteAmounts?.swapMinReceiveAmount)
  const { value: swapExpectedReceiveUsd } = useUsdAmount(quoteAmounts?.swapBuyAmount)

  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()

  const cowShedAddress = useCurrentAccountProxy()?.data?.proxyAddress || BRIDGE_QUOTE_ACCOUNT

  return useMemo(() => {
    if (!receiveAmountInfo || !quoteAmounts || !cowShedAddress) return null

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
      recipient: cowShedAddress,
      minReceiveAmount: quoteAmounts.swapMinReceiveAmount,
      minReceiveUsdValue: swapMinReceiveAmountUsd,
      expectedReceiveUsdValue: swapExpectedReceiveUsd,
    }
  }, [receiveAmountInfo, quoteAmounts, slippage, isSlippageModified, cowShedAddress, swapMinReceiveAmountUsd, swapExpectedReceiveUsd])
}
