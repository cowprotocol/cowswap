/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { type Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeOverview } from 'modules/bridge/types'

export function useSwapAndBridgeOverview(
  order: Order | undefined,
  intermediateToken: TokenWithLogo | undefined,
  outputToken: TokenWithLogo | undefined,
  targetAmounts?: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  },
  targetRecipient?: string,
  destinationChainIdOverride?: number,
): SwapAndBridgeOverview | undefined {
  // Use override if provided (from crossChainOrder), otherwise fall back to outputToken chainId
  const destinationChainId = destinationChainIdOverride ?? outputToken?.chainId
  const destChainData = useBridgeSupportedNetwork(destinationChainId)

  return useMemo(() => {
    if (!order || !outputToken || !intermediateToken) return undefined

    const sourceChainId = order.inputToken.chainId
    const sourceChainData = getChainInfo(sourceChainId)

    if (!destChainData) return undefined

    return {
      sourceChainName: sourceChainData.label,
      targetChainName: destChainData.label,
      targetCurrency: outputToken,
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
        buyAmount: CurrencyAmount.fromRawAmount(intermediateToken, order.buyAmount),
      },
      targetAmounts,
      targetRecipient,
    }
  }, [order, outputToken, intermediateToken, targetAmounts, targetRecipient, destChainData])
}
