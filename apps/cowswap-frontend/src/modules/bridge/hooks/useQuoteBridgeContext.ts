import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteBridgeContext } from '../types'

export function useQuoteBridgeContext(): QuoteBridgeContext | null {
  const { bridgeQuote } = useTradeQuote()

  const quoteAmounts = useBridgeQuoteAmounts()
  const { value: bridgeReceiveAmountUsd } = useUsdAmount(quoteAmounts?.bridgeMinReceiveAmount)

  const targetChainId = quoteAmounts?.bridgeMinReceiveAmount.currency.chainId
  const destChainData = useBridgeSupportedNetwork(targetChainId)

  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  const recipient = tradeState?.recipient || account || BRIDGE_QUOTE_ACCOUNT

  return useMemo(() => {
    if (!quoteAmounts || !bridgeQuote || !recipient) return null

    if (!destChainData) return null

    return {
      chainName: destChainData.label,
      bridgeFee: quoteAmounts.bridgeFee,
      estimatedTime: bridgeQuote.expectedFillTimeSeconds || null,
      recipient,
      sellAmount: quoteAmounts.swapMinReceiveAmount,
      buyAmount: quoteAmounts.bridgeMinReceiveAmount,
      // Since this is a quote content, we use buyAmount by default
      bridgeMinReceiveAmount: null,
      buyAmountUsd: bridgeReceiveAmountUsd,
    }
  }, [quoteAmounts, bridgeQuote, recipient, destChainData, bridgeReceiveAmountUsd])
}
