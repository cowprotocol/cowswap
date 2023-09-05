import { useMemo } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowswap/common-const'
import { useWalletInfo } from '@cowswap/wallet'

export function useSWROrdersRequest(): { owner: string; limit: number } | null {
  const { account } = useWalletInfo()

  return useMemo(() => {
    return account ? { owner: account, limit: AMOUNT_OF_ORDERS_TO_FETCH } : null
  }, [account])
}
