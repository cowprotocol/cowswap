import { useCallback } from 'react'

import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'

import { useAppSigner } from 'common/hooks/useAppSigner'
import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function useCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const { chainId } = useWalletInfo()
  const signer = useAppSigner()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))

      if (notCancellableOrders.length) {
        throw new Error(t`Some orders can not be cancelled!`)
      }

      if (!signer) {
        throw new Error(t`Wallet not connected`)
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
    [chainId, signer],
  )
}
