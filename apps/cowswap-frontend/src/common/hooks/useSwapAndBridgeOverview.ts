import { useMemo } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { type Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeOverview } from 'modules/bridge/types'

export function useSwapAndBridgeOverview(
  order: Order | undefined,
  intermediateToken: TokenWithLogo | undefined,
  targetAmounts?: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  },
  targetRecipient?: string,
): SwapAndBridgeOverview | undefined {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  return useMemo(() => {
    if (!order || !intermediateToken) return undefined

    const sourceChainId = order.inputToken.chainId
    const destinationChainId = order.outputToken.chainId
    const sourceChainData = getChainInfo(sourceChainId)
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

    if (!destChainData) return undefined

    return {
      sourceChainName: sourceChainData.label,
      targetChainName: destChainData.label,
      targetCurrency: order.outputToken,
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
        buyAmount: CurrencyAmount.fromRawAmount(intermediateToken, order.buyAmount),
      },
      targetAmounts,
      targetRecipient,
    }
  }, [order, intermediateToken, targetAmounts, targetRecipient, bridgeSupportedNetworks])
}
