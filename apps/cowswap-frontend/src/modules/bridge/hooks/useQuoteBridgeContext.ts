import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

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

  /**
   * Convert buy amount from intermediate currency to destination currency
   * After that we substract bridging costs
   */
  const buyAmount = useMemo(() => {
    if (!quoteAmounts?.bridgeFee) return

    return CurrencyAmount.fromRawAmount(
      quoteAmounts.bridgeFee.currency,
      quoteAmounts.swapBuyAmount.quotient.toString(),
    ).subtract(quoteAmounts.bridgeFee)
  }, [quoteAmounts])

  const { value: buyAmountUsd } = useUsdAmount(buyAmount)
  const { value: bridgeMinDepositAmountUsd } = useUsdAmount(quoteAmounts?.swapMinReceiveAmount)

  const targetChainId = quoteAmounts?.bridgeMinReceiveAmount.currency.chainId
  const destChainData = useBridgeSupportedNetwork(targetChainId)

  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  const expectedFillTimeSeconds = bridgeQuote?.expectedFillTimeSeconds
  const recipient = tradeState?.recipient || account || BRIDGE_QUOTE_ACCOUNT

  return useMemo(() => {
    if (!quoteAmounts || !recipient || !buyAmount) return null

    if (!destChainData) return null

    return {
      chainName: destChainData.label,
      bridgeFee: quoteAmounts.bridgeFee,
      estimatedTime: expectedFillTimeSeconds || null,
      recipient,
      sellAmount: quoteAmounts.swapBuyAmount,
      buyAmount: buyAmount,
      bridgeReceiverOverride: bridgeQuote?.bridgeReceiverOverride || null,
      bridgeMinDepositAmount: quoteAmounts.swapMinReceiveAmount,
      bridgeMinReceiveAmount: quoteAmounts.bridgeMinReceiveAmount,
      bridgeMinDepositAmountUsd,
      buyAmountUsd,
    }
  }, [
    quoteAmounts,
    expectedFillTimeSeconds,
    recipient,
    destChainData,
    buyAmount,
    buyAmountUsd,
    bridgeMinDepositAmountUsd,
    bridgeQuote?.bridgeReceiverOverride,
  ])
}
