import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { topTokenHoldersAtom } from '../state/topTokenHolders'
import { GetTopTokenHoldersParams } from '../types'

export function useGetTopTokenHolders() {
  const [cachedData, fetchTopTokenHolders] = useAtom(topTokenHoldersAtom)

  return useCallback(
    async (params: GetTopTokenHoldersParams) => {
      const key = `${params.chainId}-${params.tokenAddress}`
      if (cachedData[key]?.value) {
        return cachedData[key].value
      }
      return fetchTopTokenHolders(params)
    },
    [cachedData, fetchTopTokenHolders],
  )
}
