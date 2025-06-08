import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { useTradeTypeInfo } from 'modules/trade'

import { useNavigate } from 'common/hooks/useNavigate'

/**
 * Changing chainId in query parameters: ?chain=mainnet
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLegacySetChainIdToUrl() {
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()

  return useCallback(
    (chainId: SupportedChainId) => {
      // Don't set chainId as query parameter because swap and limit orders have different routing scheme
      if (tradeTypeInfo) return

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
    [tradeTypeInfo, navigate, location],
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const replaceURLParam = (search: string, param: string, newValue: string) => {
  const searchParams = new URLSearchParams(search)
  searchParams.set(param, newValue)
  return searchParams.toString()
}
