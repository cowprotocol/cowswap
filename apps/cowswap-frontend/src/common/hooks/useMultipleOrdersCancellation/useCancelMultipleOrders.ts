import { useCallback } from 'react'

import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { orderBookApi } from 'cowSdk'

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function useCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))
      const signer = provider?.getSigner()

      if (!chainId || !signer) return

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
