import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
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

  // Validate recipient to ensure proper fallback behavior
  // If custom recipient is invalid, fallback to account
  const recipient = useMemo(() => {
    const customRecipient = tradeState?.recipient
    // Only use custom recipient if it's a valid address
    if (isAddress(customRecipient)) {
      return customRecipient
    }
    // Fallback to wallet address or bridge quote account
    return account || BRIDGE_QUOTE_ACCOUNT
  }, [tradeState?.recipient, account])

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
  ])
}
