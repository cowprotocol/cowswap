import { useCallback } from 'react'

import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { orderBookApi } from 'cowSdk'

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function useCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const provider = useWalletProvider()
  const { chainId } = useWalletInfo()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))
      const signer = provider?.getSigner()

      if (!signer) return

      if (notCancellableOrders.length) {
        throw new Error('Some orders can not be cancelled!')
      }

      const orderUids = ordersToCancel.map((order) => order.id)
      const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellations(orderUids, chainId, signer)

      if (!signature) throw new Error('Signature is undefined!')

      await orderBookApi.sendSignedOrderCancellations(
        {
          orderUids,
          signature,
          signingScheme,
        },
        { chainId }
      )
    },
    [chainId, provider]
  )
}
