import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { getTokenBalanceSlotCacheAtom, storeTokenBalanceSlotCacheAtom } from '../state/tokenBalanceSlot'
import { GetTokenBalanceSlotParams } from '../types'
import { calculateTokenBalanceSlot } from '../utils/calculateTokenBalanceSlot'

export function useGetTokenBalanceSlot(): (params: GetTokenBalanceSlotParams) => Promise<string | undefined> {
  const getCachedSettlementBalance = useSetAtom(getTokenBalanceSlotCacheAtom)
  const storeSettlementBalanceCache = useSetAtom(storeTokenBalanceSlotCacheAtom)
  return useCallback(
    async (params: GetTokenBalanceSlotParams) => {
      const cachedBalance = getCachedSettlementBalance(params)
      if (cachedBalance) {
        return cachedBalance
      }
      try {
        const memorySlot = await calculateTokenBalanceSlot(params)
        console.log(memorySlot)
        storeSettlementBalanceCache({ ...params, memorySlot: memorySlot })
        return memorySlot
      } catch {
        console.error('Error fetching cached balance slot')
        return
      }
    },
    [getCachedSettlementBalance, storeSettlementBalanceCache],
  )
}
