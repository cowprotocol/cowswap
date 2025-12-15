import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useDerivedTradeState } from 'modules/trade'
import { useEstimatedBridgeBuyAmount } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'

import { QuoteBridgeContext } from '../types'

export function useQuoteBridgeContext(): QuoteBridgeContext | null {
  const { bridgeQuote } = useTradeQuote()

  const quoteAmounts = useBridgeQuoteAmounts()

  const { expectedToReceiveAmount: buyAmount } = useEstimatedBridgeBuyAmount() || {}
  const bridgeFee = quoteAmounts?.bridgeFee

  const expectedToReceive = useMemo(() => {
    return buyAmount && bridgeFee ? buyAmount.subtract(bridgeFee) : null
  }, [buyAmount, bridgeFee])

  const { value: buyAmountUsd } = useUsdAmount(buyAmount)
  const { value: bridgeMinDepositAmountUsd } = useUsdAmount(quoteAmounts?.swapMinReceiveAmount)
  const { value: expectedToReceiveUsd } = useUsdAmount(expectedToReceive)

  const targetChainId = buyAmount?.currency.chainId
  const destChainData = useBridgeSupportedNetwork(targetChainId)

  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  const expectedFillTimeSeconds = bridgeQuote?.expectedFillTimeSeconds
  const recipient = tradeState?.recipient || account || BRIDGE_QUOTE_ACCOUNT

  return useMemo(() => {
    if (!quoteAmounts || !recipient || !buyAmount) return null

    if (!destChainData) return null

    const bridgeMinReceiveAmount = bridgeQuote
      ? CurrencyAmount.fromRawAmount(buyAmount.currency, bridgeQuote.amountsAndCosts.afterSlippage.buyAmount.toString())
      : null

    return {
      chainName: destChainData.label,
      bridgeFee: quoteAmounts.bridgeFee,
      estimatedTime: expectedFillTimeSeconds || null,
      recipient,
      sellAmount: quoteAmounts.swapBuyAmount,
      buyAmount: buyAmount,
      bridgeReceiverOverride: bridgeQuote?.bridgeReceiverOverride || null,
      bridgeMinDepositAmount: quoteAmounts.swapMinReceiveAmount,
      bridgeMinReceiveAmount,
      bridgeMinDepositAmountUsd,
      buyAmountUsd,
      expectedToReceive,
      expectedToReceiveUsd,
    }
  }, [
    quoteAmounts,
    expectedFillTimeSeconds,
    recipient,
    destChainData,
    buyAmount,
    buyAmountUsd,
    bridgeMinDepositAmountUsd,
    bridgeQuote,
    expectedToReceive,
    expectedToReceiveUsd,
  ])
}
