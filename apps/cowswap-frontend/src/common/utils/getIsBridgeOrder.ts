import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

export function getIsBridgeOrder(order: Order | EnrichedOrder | undefined): boolean {
  if (!order) return false

  const appData = orderIsAppOrder(order) ? order.apiAdditionalInfo?.fullAppData || order.fullAppData : order.fullAppData

  if (appData) {
    try {
      const orderBridgeProvider = bridgingSdk.getProviderFromAppData(appData)

      if (orderBridgeProvider) return true
    } catch {}
  }

  if (orderIsAppOrder(order)) {
    return order.inputToken.chainId !== order.outputToken.chainId
  }

  return false
}

function orderIsAppOrder(order: Order | EnrichedOrder): order is Order {
  return !!(order as Order).inputToken
}
