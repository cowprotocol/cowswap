import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { type Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeOverview, SwapResultContext } from 'modules/bridge/types'

export function useSwapAndBridgeOverview(
  order: Order | undefined,
  swapResultContext: SwapResultContext | undefined,
  targetAmounts?: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  },
): SwapAndBridgeOverview | undefined {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  return useMemo(() => {
    if (!order || !swapResultContext) return undefined

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
        buyAmount: CurrencyAmount.fromRawAmount(swapResultContext.intermediateToken, order.buyAmount),
      },
      targetAmounts,
    }
  }, [order, swapResultContext, targetAmounts, bridgeSupportedNetworks])
}
