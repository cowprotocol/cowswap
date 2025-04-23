import { useCallback } from 'react'

import { getQuoteUnsupportedToken } from '@cowprotocol/common-utils'
import { SupportedChainId, TradeParameters } from '@cowprotocol/cow-sdk'
import { useAddUnsupportedToken } from '@cowprotocol/tokens'

import QuoteApiError from 'api/cowProtocol/errors/QuoteError'

export function useProcessUnsupportedTokenError() {
  const addGpUnsupportedToken = useAddUnsupportedToken()

  return useCallback(
    (error: QuoteApiError, chainId: SupportedChainId, quoteParams: TradeParameters) => {
      const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteParams)

      if (unsupportedTokenAddress) {
        addGpUnsupportedToken(chainId, unsupportedTokenAddress)
      }
    },
    [addGpUnsupportedToken],
  )
}
