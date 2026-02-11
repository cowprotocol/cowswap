import { useCallback } from 'react'

import { getGlobalAdapter } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'
import { sendOrderCancellation } from 'legacy/utils/trade'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOffChainCancelOrder() {
  const { account, chainId } = useWalletInfo()
  const cancelPendingOrder = useRequestOrderCancellation()

  const adapter = getGlobalAdapter()

  return useCallback(
    async (order: Order): Promise<void> => {
      if (!account) {
        return
      }
      const { signer } = adapter

      return sendOrderCancellation({ chainId, orderId: order.id, signer, account, cancelPendingOrder })
    },
    [account, adapter, cancelPendingOrder, chainId],
  )
}
