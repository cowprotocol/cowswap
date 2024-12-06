import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'
import { solversInfoAtom, SolverInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useSolversInfo(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    const env = isProdLike ? 'prod' : 'barn' // Should match what's set on CMS!

    return allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
      if (
        info.solverNetworks.some(
          ({ env: solverEnv, chainId: solverChainId, active }) =>
            solverEnv === env && solverChainId === chainId && active,
        )
      ) {
        acc[info.solverId] = info
      }

      return acc
    }, {})
  }, [chainId, allSolversInfo])
}
