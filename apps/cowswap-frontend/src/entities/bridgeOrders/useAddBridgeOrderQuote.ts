import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { BridgeOrderQuoteData } from 'common/types/bridge'

import { bridgeOrderQuoteAtom } from './bridgeOrderQuoteAtom'

export function useAddBridgeOrderQuote(): (order: BridgeOrderQuoteData) => void {
  const { chainId, account } = useWalletInfo()
  const setBridgeOrders = useSetAtom(bridgeOrderQuoteAtom)

  return useCallback(
    (order: BridgeOrderQuoteData) => {
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
