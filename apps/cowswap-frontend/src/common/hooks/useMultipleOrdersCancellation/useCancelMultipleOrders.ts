import { useCallback } from 'react'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { orderBookApi } from 'cowSdk'

import { Order } from 'legacy/state/orders/actions'

import { useSendOnChainCancellation } from 'common/hooks/useCancelOrder/useSendOnChainCancellation'
import { getIsPrototypeTwapCancellationOrder } from 'common/utils/getIsPrototypeTwapCancellationOrder'
import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function useCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const { chainId } = useWalletInfo()
  const sendOnChainCancellation = useSendOnChainCancellation()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))
      const prototypeOrders = ordersToCancel.filter(getIsPrototypeTwapCancellationOrder)
      const offChainOrders = ordersToCancel.filter((order) => !getIsPrototypeTwapCancellationOrder(order))

      if (notCancellableOrders.length) {
        throw new Error(t`Some orders can not be cancelled!`)
      }

      if (prototypeOrders.length) {
        await Promise.all(
          prototypeOrders.map((order) => {
            return sendOnChainCancellation(order as Order)
          }),
        )
      }

      if (!offChainOrders.length) {
        return
      }

      const signer = provider?.getSigner()

      if (!signer) return

      const orderUids = offChainOrders.map((order) => order.id)
      const signedOrderCancellations = await OrderSigningUtils.signOrderCancellations(orderUids, chainId, signer, {
        env: isBarnBackendEnv ? 'staging' : 'prod',
        settlementContractOverride: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
      })
      const { signature, signingScheme } = signedOrderCancellations

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
    [chainId, provider, sendOnChainCancellation],
  )
}
