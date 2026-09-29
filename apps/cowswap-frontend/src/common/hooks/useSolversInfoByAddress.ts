import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { SolverInfo, solversInfoAtom } from '@cowprotocol/core'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Maps the on-chain solver address (normalized) -> SolverInfo, for the given chain/env.
 *
 * Used to resolve a solver's display name and logo from the address returned by the orderbook
 * `/status` endpoint.
 */
export function useSolversInfoByAddress(chainId: SupportedChainId): Record<string, SolverInfo> {
  const allSolversInfo = useAtomValue(solversInfoAtom)

  return useMemo(() => {
    // Filters by 'staging' for non-prod (dev/local/"barn") environments because the `solversInfoAtom` data (via CMS mapping) uses 'staging' for these cases.
    const envToFilter = isBarnBackendEnv ? 'staging' : 'prod'

    return allSolversInfo.reduce<Record<string, SolverInfo>>((acc, info) => {
      info.solverNetworks.forEach(({ env: solverEnv, chainId: solverChainId, address }) => {
        if (solverEnv === envToFilter && solverChainId === chainId && address) {
          acc[getAddressKey(address)] = info
        }
      })

      return acc
    }, {})
  }, [chainId, allSolversInfo])
}
