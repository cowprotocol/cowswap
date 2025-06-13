import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation } from 'legacy/state/orders/hooks'
import { sendOrderCancellation } from 'legacy/utils/trade'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOffChainCancelOrder() {
  const provider = useWalletProvider()
  const { account, chainId } = useWalletInfo()
  const cancelPendingOrder = useRequestOrderCancellation()

  return useCallback(
    async (order: Order): Promise<void> => {
      if (!account || !provider) {
        return
      }
      const signer = provider.getSigner()

      return sendOrderCancellation({ chainId, orderId: order.id, signer, account, cancelPendingOrder })
    },
    [account, cancelPendingOrder, chainId, provider]
  )
}
