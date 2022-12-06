import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { useRequestOrderCancellation } from 'state/orders/hooks'
import { Order } from 'state/orders/actions'
import { sendOrderCancellation } from 'utils/trade'

export function useOffChainCancelOrder() {
  const { account, chainId, provider } = useWeb3React()
  const cancelPendingOrder = useRequestOrderCancellation()

  return useCallback(
    async (order: Order): Promise<void> => {
      if (!account || !chainId || !provider) {
        return
      }
      const signer = provider.getSigner()

      return sendOrderCancellation({ chainId, orderId: order.id, signer, account, cancelPendingOrder })
    },
    [account, cancelPendingOrder, chainId, provider]
  )
}
