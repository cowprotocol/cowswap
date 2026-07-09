import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

// Trade routes that handle their own chain resolution (e.g. via SwapPageRedirect).
// Setting ?chain= on these paths causes unnecessary navigation that races with their own redirect logic.
const CHAINLESS_TRADE_ROUTES = ['/swap', '/limit', '/advanced', '/yield']

/**
 * Updates the URL to reflect the selected chain:
 * - When the path has a chain segment (e.g. /42161/swap), replaces it with the new chainId so the URL stays in sync.
 * - When on the root path (/) or a chainId-less trade route (/swap, /limit, etc.), does nothing —
 *   the router's redirect flow will resolve to the correct trade URL.
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

      // On the root path or chainId-less trade routes, the page itself handles chain resolution.
      // Setting ?chain= here races with that redirect logic and can leave the widget stuck.
      if (pathname === '/') return
      if (CHAINLESS_TRADE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) return

      const chainInfo = getChainInfo(chainId)
      if (!chainInfo) return

      const newSearch = replaceURLParam(location.search, 'chain', chainInfo.name)
      navigate(
        {
          pathname,
          search: newSearch,
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
