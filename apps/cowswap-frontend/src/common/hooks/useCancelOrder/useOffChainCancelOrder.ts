import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'
import { sendOrderCancellation } from 'legacy/utils/trade'

import { useAppSigner } from 'common/hooks/useAppSigner'

export function useOffChainCancelOrder(): (order: Order) => Promise<void> {
  const { account, chainId } = useWalletInfo()
  const cancelPendingOrder = useRequestOrderCancellation()
  const signer = useAppSigner()

  return useCallback(
    async (order: Order): Promise<void> => {
      if (!account || !signer) {
        return
      }
      return sendOrderCancellation({ chainId, orderId: order.id, signer, account, cancelPendingOrder })
    },
    [account, cancelPendingOrder, chainId, signer],
  )
}
