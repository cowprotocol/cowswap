import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'
import { solversInfoAtom, SolverInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useSolversInfo(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    // Filters by 'staging' for non-prod (dev/local/"barn") environments because the `solversInfoAtom` data (via CMS mapping) uses 'staging' for these cases.
    const envToFilter = isProdLike ? 'prod' : 'staging'

    return allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
      if (
        info.solverNetworks.some(
          ({ env: solverEnv, chainId: solverChainId, active }) =>
            solverEnv === envToFilter && solverChainId === chainId && active,
        )
      ) {
        acc[info.solverId] = info
      }

      return acc
    }, {})
  }, [chainId, allSolversInfo])
}
