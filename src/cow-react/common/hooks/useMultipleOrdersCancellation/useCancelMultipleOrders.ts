import { useCallback } from 'react'
import { isOrderCancellable } from '@cow/common/utils/isOrderCancellable'
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { orderBookApi } from '@cow/cowSdk'
import { Order } from 'state/orders/actions'
import { useWeb3React } from '@web3-react/core'
import { useWalletInfo } from '@cow/modules/wallet'

export function useCancelMultipleOrders(): (orders: Order[]) => Promise<void> {
  const { provider } = useWeb3React()
  const { chainId } = useWalletInfo()

  return useCallback(
    async (ordersToCancel: Order[]) => {
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
