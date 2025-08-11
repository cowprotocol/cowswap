import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

/**
 * Changing chainId in query parameters: ?chain=mainnet
 */
export function useLegacySetChainIdToUrl(): (chainId: SupportedChainId) => void {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (chainId: SupportedChainId) => {
      // Don't set chainId as query parameter when it's already set as /{chainId}
      if (/^\/\d+\//.test(location.pathname)) return

      const chainInfo = getChainInfo(chainId)
      if (!chainInfo) return

      navigate(
        {
          pathname: location.pathname,
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
