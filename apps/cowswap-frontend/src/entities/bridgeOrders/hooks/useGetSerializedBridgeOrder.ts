import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeOrderDataSerialized } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeOrdersSerializedMap } from './useBridgeOrdersSerializedMap'

export function useGetSerializedBridgeOrder(): (
  chainId: SupportedChainId,
  orderId: string,
  account?: string,
) => BridgeOrderDataSerialized | undefined {
  const { account } = useWalletInfo()
  const bridgeOrdersMap = useBridgeOrdersSerializedMap()

  return useCallback(
    (chainId: SupportedChainId, orderId: string, orderAccount?: string) => {
      const effectiveAccount = orderAccount ?? account

      if (!effectiveAccount) return undefined

      const bridgeOrders = bridgeOrdersMap[chainId]?.[effectiveAccount.toLowerCase()]

      return bridgeOrders?.find((i) => i.orderUid === orderId)
    },
    [account, bridgeOrdersMap],
  )
}
