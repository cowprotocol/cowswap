import { useCallback } from 'react'
import { sendOrderCancellation } from 'utils/trade'
import { useWeb3React } from '@web3-react/core'
import { useRequestOrderCancellation } from 'state/orders/hooks'

export const useCancelOrder = () => {
  const { account, chainId, provider } = useWeb3React()
  const cancelPendingOrder = useRequestOrderCancellation()
  return useCallback(
    async (orderId: string): Promise<void> => {
      if (!account || !chainId || !provider) {
        return
      }
      const signer = provider.getSigner()
      return sendOrderCancellation({ chainId, orderId, signer, account, cancelPendingOrder })
    },
    [account, cancelPendingOrder, chainId, provider]
  )
}
