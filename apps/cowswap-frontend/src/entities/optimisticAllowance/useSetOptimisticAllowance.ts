import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { getOptimisticAllowanceKey } from './getOptimisticAllowanceKey'
import { optimisticAllowancesAtom } from './optimisticAllowancesAtom'

export interface SetOptimisticAllowanceParams {
  tokenAddress: string
  owner: string
  spender: string
  amount: bigint
  blockNumber: bigint
  chainId: number
}

export function useSetOptimisticAllowance(): (params: SetOptimisticAllowanceParams) => void {
  const setOptimisticAllowances = useSetAtom(optimisticAllowancesAtom)

  return useCallback(
    (params: SetOptimisticAllowanceParams) => {
      const key = getOptimisticAllowanceKey(params)

      // Set optimistic allowance immediately
      setOptimisticAllowances((state) => ({
        ...state,
        [key]: {
          amount: params.amount,
          blockNumber: params.blockNumber,
          timestamp: Date.now(),
        },
      }))
    },
    [setOptimisticAllowances],
  )
}
