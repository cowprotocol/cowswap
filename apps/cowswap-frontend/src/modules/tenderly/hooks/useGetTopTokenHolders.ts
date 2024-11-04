import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { topTokenHoldersAtom } from '../state/topTokenHolders'
import { GetTopTokenHoldersParams } from '../types'

export function useGetTopTokenHolders() {
  const [cachedData, fetchTopTokenHolders] = useAtom(topTokenHoldersAtom)

  return useCallback(
    async (params: GetTopTokenHoldersParams) => {
      const key = `${params.chainId}-${params.tokenAddress}`
      return cachedData[key]?.value || fetchTopTokenHolders(params)
    },
    [cachedData, fetchTopTokenHolders],
  )
}
