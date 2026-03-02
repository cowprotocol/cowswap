import { useCallback } from 'react'

import { getGlobalAdapter, OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function useCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const { chainId } = useWalletInfo()

  const adapter = getGlobalAdapter()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))
      const { signer } = adapter

      if (notCancellableOrders.length) {
        throw new Error(t`Some orders can not be cancelled!`)
      }

      const orderUids = ordersToCancel.map((order) => order.id)
      const { signature, signingScheme } = await OrderSigningUtils.signOrderCancellations(orderUids, chainId, signer)

      if (!signature) throw new Error(t`Signature is undefined!`)

      await orderBookApi.sendSignedOrderCancellations(
        {
          orderUids,
          signature,
          signingScheme,
        },
        { chainId },
      )
    },
    [adapter, chainId],
  )
}
