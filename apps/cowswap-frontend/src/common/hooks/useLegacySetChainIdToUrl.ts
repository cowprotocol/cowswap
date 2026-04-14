import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

/**
 * Updates the URL to reflect the selected chain:
 * - When the path has a chain segment (e.g. /42161/swap), replaces it with the new chainId so the URL stays in sync.
 * - Otherwise sets the legacy query parameter ?chain=...
 */
export function useLegacySetChainIdToUrl(): (chainId: SupportedChainId) => void {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (chainId: SupportedChainId) => {
      const pathname = location.pathname

      // Path-based chain (e.g. /42161/swap): replace the chain segment so the URL updates and connect flow uses it
      if (/^\/\d+\//.test(pathname)) {
        const newPathname = pathname.replace(/^\/\d+/, `/${chainId}`)
        navigate({ pathname: newPathname, search: location.search }, { replace: true })
        return
      }

      const chainInfo = getChainInfo(chainId)
      if (!chainInfo) return

      navigate(
        {
          pathname,
          search: replaceURLParam(location.search, 'chain', chainInfo.name),
        },
        { replace: true },
      )
    },
    [navigate, location],
  )
}

const replaceURLParam = (search: string, param: string, newValue: string): string => {
  const searchParams = new URLSearchParams(search)
  searchParams.set(param, newValue)
  return searchParams.toString()
}
