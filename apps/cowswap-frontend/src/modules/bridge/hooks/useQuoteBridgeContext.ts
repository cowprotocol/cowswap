import { useMemo } from 'react'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useEstimatedBridgeBuyAmount } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { getChainType } from 'common/chains/nonEvm'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'
import { useBridgeQuoteRecipient } from './useBridgeQuoteRecipient'

import { QuoteBridgeContext } from '../types'

export function useQuoteBridgeContext(): QuoteBridgeContext | null {
  const { bridgeQuote } = useTradeQuote()

  const quoteAmounts = useBridgeQuoteAmounts()
  const bridgeFee = quoteAmounts?.bridgeFee
  const estimatedAmounts = useEstimatedBridgeBuyAmount()
  const buyAmount = estimatedAmounts?.expectedToReceiveAmount
  const expectedToReceiveAmount = useMemo(() => {
    if (!buyAmount || !bridgeFee) return null

    return buyAmount.subtract(bridgeFee)
  }, [buyAmount, bridgeFee])

  const { value: buyAmountUsd } = useUsdAmount(buyAmount)
  const { value: bridgeMinDepositAmountUsd } = useUsdAmount(quoteAmounts?.bridgeMinReceiveAmount)
  const { value: expectedToReceiveUsd } = useUsdAmount(expectedToReceiveAmount)
  const { value: bridgeMinReceiveAmountUsd } = useUsdAmount(quoteAmounts?.bridgeMinReceiveAmount)

  const targetChainId = quoteAmounts?.bridgeMinReceiveAmount.currency.chainId
  const destinationChainType = getChainType(targetChainId)
  const destChainData = useBridgeSupportedNetwork(targetChainId)

  const expectedFillTimeSeconds = bridgeQuote?.expectedFillTimeSeconds
  const recipient = useBridgeQuoteRecipient()

  return useMemo(() => {
    if (!quoteAmounts?.swapExpectedReceive || !recipient || !buyAmount || targetChainId == null) return null

    if (!destChainData) return null

    return {
      chainName: destChainData.label,
      destinationChainId: targetChainId,
      destinationChainType,
      bridgeFee: quoteAmounts.bridgeFee,
      estimatedTime: expectedFillTimeSeconds || null,
      recipient,
      sellAmount: quoteAmounts.swapExpectedReceive,
      buyAmount: buyAmount,
      bridgeReceiverOverride: bridgeQuote?.bridgeReceiverOverride || null,
      bridgeMinDepositAmount: quoteAmounts.swapMinReceiveAmount,
      bridgeMinReceiveAmount: quoteAmounts.bridgeMinReceiveAmount,
      bridgeMinReceiveAmountUsd,
      bridgeMinDepositAmountUsd,
      buyAmountUsd,
      expectedToReceive: expectedToReceiveAmount,
      expectedToReceiveUsd,
    }
  }, [
    quoteAmounts,
    expectedFillTimeSeconds,
    recipient,
    destChainData,
    targetChainId,
    destinationChainType,
    buyAmount,
    buyAmountUsd,
    bridgeMinDepositAmountUsd,
    bridgeQuote?.bridgeReceiverOverride,
    expectedToReceiveAmount,
    expectedToReceiveUsd,
    bridgeMinReceiveAmountUsd,
  ])
}
