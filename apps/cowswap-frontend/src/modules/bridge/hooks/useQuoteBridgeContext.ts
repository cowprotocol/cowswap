import { useMemo } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
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

  const quoteAmounts = useBridgeQuoteAmounts(true)
  // TODO: it's a fast fix, should be done inside of useBridgeQuoteAmounts
  const reversedQuoteAmounts = useBridgeQuoteAmounts(false)
  const intermediateBuyAmount = reversedQuoteAmounts?.swapBuyAmount

  /**
   * Convert buy amount from intermediate currency to destination currency
   * After that we substract bridging costs
   */
  const buyAmount = useMemo(() => {
    if (!quoteAmounts?.bridgeFee || !intermediateBuyAmount) return

    const swapBuyAmount =
      quoteAmounts.bridgeFee.currency.decimals !== intermediateBuyAmount.currency.decimals
        ? FractionUtils.adjustDecimalsAtoms(
            intermediateBuyAmount,
            intermediateBuyAmount.currency.decimals,
            quoteAmounts.bridgeFee.currency.decimals,
          )
        : intermediateBuyAmount

    return CurrencyAmount.fromRawAmount(quoteAmounts.bridgeFee.currency, swapBuyAmount.quotient.toString()).subtract(
      quoteAmounts.bridgeFee,
    )
  }, [quoteAmounts, intermediateBuyAmount])

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
