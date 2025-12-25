import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { BridgeOrderData, Nullish } from '@cowprotocol/types'

import { useBridgeOrderData, useCrossChainOrder } from 'entities/bridgeOrders'

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
  const orderFromStore = useOrder({ id: orderUid, chainId })
  const bridgeOrderFromStore = useBridgeOrderData(orderUid)
  const { data: bridgeOrderFromApi } = useCrossChainOrder(chainId, orderUid)

  return useMemo(() => {
    if (!orderFromStore) return undefined
    return {
      orderFromStore,
      bridgeOrderFromStore,
      bridgeOrderFromApi,
    }
  }, [orderFromStore, bridgeOrderFromApi, bridgeOrderFromStore])
}
