import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { SolverInfo, solversInfoAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useSolversInfo(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    // Filters by 'staging' for non-prod (dev/local/"barn") environments because the `solversInfoAtom` data (via CMS mapping) uses 'staging' for these cases.
    const envToFilter = isBarnBackendEnv ? 'staging' : 'prod'

    return allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
      if (
        info.solverNetworks.some(
          ({ env: solverEnv, chainId: solverChainId }) => solverEnv === envToFilter && solverChainId === chainId,
        )
      ) {
        acc[info.solverId.toLowerCase()] = info
      }

      return acc
    }, {})
  }, [chainId, allSolversInfo])
}

/**
 * Same as {@link useSolversInfo} but keyed by the on-chain solver address (lowercased) for the
 * given chain/env. Used to resolve solver branding from the address returned by the orderbook
 * `/status` endpoint, without relying on the (soon to be removed) backend solver name.
 */
export function useSolversInfoByAddress(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    // Filters by 'staging' for non-prod (dev/local/"barn") environments because the `solversInfoAtom` data (via CMS mapping) uses 'staging' for these cases.
    const envToFilter = isBarnBackendEnv ? 'staging' : 'prod'

    return allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
      info.solverNetworks.forEach(({ env: solverEnv, chainId: solverChainId, address }) => {
        if (solverEnv === envToFilter && solverChainId === chainId && address) {
          acc[address.toLowerCase()] = info
        }
      })

      return acc
    }, {})
  }, [chainId, allSolversInfo])
}
