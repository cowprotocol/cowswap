import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

export function usePendingOrdersCount(chainId: SupportedChainId, account?: string): number {
  return useOnlyPendingOrders(chainId, account).length
}
