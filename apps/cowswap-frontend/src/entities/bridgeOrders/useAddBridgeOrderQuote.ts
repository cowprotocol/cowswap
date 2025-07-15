import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { BridgeOrderData } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { bridgeOrderQuoteAtom } from './bridgeOrderQuoteAtom'

export function useAddBridgeOrderQuote(): (order: BridgeOrderData) => void {
  const { chainId, account } = useWalletInfo()
  const setBridgeOrders = useSetAtom(bridgeOrderQuoteAtom)

  return useCallback(
    (order: BridgeOrderData) => {
      if (!account) return

      setBridgeOrders((state) => {
        const orders = state[chainId]?.[account] || []

        orders.push(order)

        return {
          ...state,
          [chainId]: {
            ...state[chainId],
            [account]: orders,
          },
        }
      })
    },
    [setBridgeOrders, account, chainId],
  )
}
