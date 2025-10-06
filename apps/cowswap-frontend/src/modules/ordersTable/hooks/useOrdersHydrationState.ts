import { useMemo } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import type { AppState } from 'legacy/state'
import type { Order } from 'legacy/state/orders/actions'
import { ContractDeploymentBlocks } from 'legacy/state/orders/consts'
import type { OrdersStateNetwork } from 'legacy/state/orders/reducer'

interface UseOrdersHydrationStateParams {
  chainId: SupportedChainId | undefined
  orders: Order[]
}

export function useOrdersHydrationState({ chainId, orders }: UseOrdersHydrationStateParams): boolean {
  const networkState = useSelector<AppState, OrdersStateNetwork | undefined>((state) => {
    if (chainId === undefined) {
      return undefined
    }

    return state.orders?.[chainId as SupportedChainId]
  })

  const ordersLength = orders.length

  return useMemo(() => {
    if (chainId === undefined) {
      return false
    }

    if (ordersLength > 0) {
      return true
    }

    const chainKey = chainId as SupportedChainId
    const lastCheckedBlock = networkState?.lastCheckedBlock
    const defaultBlock = ContractDeploymentBlocks[chainKey] ?? 0

    return typeof lastCheckedBlock === 'number' && lastCheckedBlock !== defaultBlock
  }, [chainId, networkState?.lastCheckedBlock, ordersLength])
}
