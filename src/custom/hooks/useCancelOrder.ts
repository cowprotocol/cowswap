import { useCallback } from 'react'
import { sendOrderCancellation } from 'utils/trade'
import { useActiveWeb3React } from 'hooks'
import { useRequestOrderCancellation } from 'state/orders/hooks'

export const useCancelOrder = () => {
  const { account, chainId, library } = useActiveWeb3React()
  const cancelPendingOrder = useRequestOrderCancellation()
  return useCallback(
    async (orderId: string): Promise<void> => {
      if (!account || !chainId || !library) {
        return
      }
      const signer = library.getSigner()
      return sendOrderCancellation({ chainId, orderId, signer, account, cancelPendingOrder })
    },
    [account, cancelPendingOrder, chainId, library]
  )
}
