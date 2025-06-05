import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { useDerivedTradeState, useReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteBridgeContext } from '../types'

export function useQuoteBridgeContext(): QuoteBridgeContext | null {
  const { bridgeQuote } = useTradeQuote()

  const receiveAmountInfo = useReceiveAmountInfo()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  const quoteAmounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)
  const { value: bridgeReceiveAmountUsd } = useUsdAmount(quoteAmounts?.bridgeMinReceiveAmount)

  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  const recipient = tradeState?.recipient || account

  return useMemo(() => {
    if (!quoteAmounts || !bridgeQuote || !recipient) return null

    const targetChainId = quoteAmounts.swapMinReceiveAmount.currency.chainId
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === targetChainId)

    if (!destChainData) return null

    return {
      chainName: destChainData.label,
      bridgeFee: quoteAmounts.bridgeFee,
      estimatedTime: bridgeQuote.expectedFillTimeSeconds || null,
      recipient,
      sellAmount: quoteAmounts.swapMinReceiveAmount,
      buyAmount: quoteAmounts.bridgeMinReceiveAmount,
      buyAmountUsd: bridgeReceiveAmountUsd,
    }
  }, [quoteAmounts, bridgeQuote, recipient, bridgeSupportedNetworks, bridgeReceiveAmountUsd])
}
