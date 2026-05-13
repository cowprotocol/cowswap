import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { BridgeStatusResult } from '@cowprotocol/sdk-bridging'
import { useWalletInfo } from '@cowprotocol/wallet'

import { bridgeOrdersAtom } from '../state/bridgeOrdersAtom'

export function useUpdateBridgeOrderQuote(): (orderUid: string, statusResult: BridgeStatusResult) => void {
  const { chainId, account } = useWalletInfo()
  const setBridgeOrders = useSetAtom(bridgeOrdersAtom)

  return useCallback(
    (orderUid: string, statusResult: BridgeStatusResult) => {
      if (!account) return

      setBridgeOrders((state) => {
        const orders = state[chainId]?.[getAddressKey(account)] || []

        return {
          ...state,
          [chainId]: {
            ...state[chainId],
            [getAddressKey(account)]: orders.map((order) => {
              if (order.orderUid === orderUid) {
                return {
                  ...order,
                  statusResult,
                }
              }

              return order
            }),
          },
        }
      })
    },
    [setBridgeOrders, account, chainId],
  )
}
