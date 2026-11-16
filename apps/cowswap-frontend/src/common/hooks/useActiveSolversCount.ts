import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { solversInfoAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * How many distinct solvers have an active deployment on the given chain/env.
 *
 * Counts solvers and not addresses: the CMS keeps a solver's retired deployments alongside the
 * live one, so one solver can contribute several addresses for the same chain.
 */
export function useActiveSolversCount(chainId: SupportedChainId): number {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    const envToFilter = isBarnBackendEnv ? 'staging' : 'prod'

    const activeSolverIds = allSolversInfo.reduce<Set<string>>((acc, info) => {
      const hasActiveDeployment = info.solverNetworks.some(
        ({ env, chainId: solverChainId, isActive }) =>
          isActive !== false && env === envToFilter && solverChainId === chainId,
      )

      if (hasActiveDeployment) {
        acc.add(info.solverId)
      }

      return acc
    }, new Set())

    return activeSolverIds.size
  }, [chainId, allSolversInfo])
}
