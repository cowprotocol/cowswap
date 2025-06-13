import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { topTokenHoldersAtom } from '../state/topTokenHolders'
import { GetTopTokenHoldersParams } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
