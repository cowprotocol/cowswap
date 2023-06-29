import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation, useNavigate } from 'react-router-dom'

import { getChainInfo } from 'legacy/constants/chainInfo'

import { useTradeTypeInfo } from 'modules/trade'

/**
 * Changing chainId in query parameters: ?chain=mainnet
 */
export function useLegacySetChainIdToUrl() {
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()

  return useCallback(
    (chainId: SupportedChainId) => {
      // Don't set chainId as query parameter because swap and limit orders have different routing scheme
      if (tradeTypeInfo) return

      navigate(
        {
          pathname: location.pathname,
          search: replaceURLParam(location.search, 'chain', getChainInfo(chainId).name),
        },
        { replace: true }
      )
    },
    [tradeTypeInfo, navigate, location]
  )
}

const replaceURLParam = (search: string, param: string, newValue: string) => {
  const searchParams = new URLSearchParams(search)
  searchParams.set(param, newValue)
  return searchParams.toString()
}
