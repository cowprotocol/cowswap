import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ordersLimitAtom } from '../state/ordersLimitAtom'

export function useSWROrdersRequest(): { owner: string; limit: number } | null {
  const { account } = useWalletInfo()
  const { limit } = useAtomValue(ordersLimitAtom)

  return useMemo(() => {
    return account ? { owner: account, limit } : null
  }, [account, limit])
}
