import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { BridgeOrderData } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { bridgeOrdersAtom } from '../state/bridgeOrdersAtom'

export function useAddBridgeOrder(): (order: BridgeOrderData) => void {
  const { chainId, account } = useWalletInfo()
  const setBridgeOrders = useSetAtom(bridgeOrdersAtom)

  return useCallback(
    (order: BridgeOrderData) => {
      if (!account) return

      const accountLower = account.toLowerCase()

      setBridgeOrders((state) => {
        const orders = state[chainId]?.[accountLower] || []

        orders.push(order)

        return {
          ...state,
          [chainId]: {
            ...state[chainId],
            [accountLower]: orders,
          },
        }
      })
    },
    [setBridgeOrders, account, chainId],
  )
}
