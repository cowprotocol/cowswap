import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solversInfoAtom } from '../state'
import { SolverInfo } from '../types'

export function useSolversInfo(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(
    () =>
      allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
        if (info.chainIds.includes(chainId)) {
          acc[info.solverId] = info
        }

        return acc
      }, {}),
    [chainId, allSolversInfo]
  )
}
