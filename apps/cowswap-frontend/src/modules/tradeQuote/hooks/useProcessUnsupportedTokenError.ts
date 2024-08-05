import { useCallback } from 'react'

import { getQuoteUnsupportedToken } from '@cowprotocol/common-utils'
import { useAddUnsupportedToken } from '@cowprotocol/tokens'

import QuoteApiError from 'api/cowProtocol/errors/QuoteError'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useProcessUnsupportedTokenError() {
  const addGpUnsupportedToken = useAddUnsupportedToken()

  return useCallback(
    (error: QuoteApiError, quoteParams: { chainId: SupportedChainId; sellToken: string; buyToken: string }) => {
      const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteParams)

      if (unsupportedTokenAddress) {
        addGpUnsupportedToken(quoteParams.chainId, unsupportedTokenAddress)
      }
    },
    [addGpUnsupportedToken]
  )
}
