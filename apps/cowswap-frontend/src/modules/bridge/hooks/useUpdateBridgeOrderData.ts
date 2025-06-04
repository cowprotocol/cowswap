import { useCallback } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useInterval } from '@cowprotocol/common-hooks'
import { CrossChainOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

const BRIDGE_TRANSACTION_POLLING_INTERVAL = ms`3s`

export function useUpdateBridgeOrderData(
  chainId: SupportedChainId,
  order: Order | undefined,
  setCrossChainOrder: (order: CrossChainOrder | null) => void,
  pollingInterval = BRIDGE_TRANSACTION_POLLING_INTERVAL,
) {
  const updateBridgeOrderData = useCallback(async () => {
    const rpcProvider = getRpcProvider(chainId)

    if (!order || !rpcProvider) return

    const crossChainOrder = await bridgingSdk.getOrder({
      chainId,
      orderId: order.id,
      rpcProvider,
    })

    setCrossChainOrder(crossChainOrder)
  }, [chainId, order, setCrossChainOrder])

  useInterval(updateBridgeOrderData, pollingInterval, true)
}
