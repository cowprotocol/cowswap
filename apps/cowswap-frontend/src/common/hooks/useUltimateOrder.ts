import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { BridgeOrderData, Nullish } from '@cowprotocol/types'

import { useBridgeOrderData, useCrossChainOrder } from 'entities/bridgeOrders'
import { mapTwapOrderToStoreOrder, useTwapOrderById, useTwapOrdersTokens } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

export interface UltimateOrderData {
  orderFromStore: Order
  bridgeOrderFromStore?: Nullish<BridgeOrderData>
  bridgeOrderFromApi?: Nullish<CrossChainOrder>
}

export function useUltimateOrder(
  chainId: SupportedChainId | undefined,
  orderUid: string | undefined,
): UltimateOrderData | undefined {
  const swapOrderFromStore = useOrder({ id: orderUid, chainId })
  const bridgeOrderFromStore = useBridgeOrderData(orderUid)
  const { data: bridgeOrderFromApi } = useCrossChainOrder(chainId, orderUid)
  const twapOrdersTokens = useTwapOrdersTokens()
  const twapOrder = useTwapOrderById(orderUid)

  const twapOrderFromStore = useMemo(() => {
    if (!twapOrder || !twapOrdersTokens) return null
    return mapTwapOrderToStoreOrder(twapOrder, twapOrdersTokens)
  }, [twapOrder, twapOrdersTokens])

  const orderFromStore = swapOrderFromStore ?? twapOrderFromStore

  return useMemo(() => {
    if (!orderFromStore) return undefined
    return {
      orderFromStore,
      bridgeOrderFromStore,
      bridgeOrderFromApi,
    }
  }, [orderFromStore, bridgeOrderFromApi, bridgeOrderFromStore])
}
