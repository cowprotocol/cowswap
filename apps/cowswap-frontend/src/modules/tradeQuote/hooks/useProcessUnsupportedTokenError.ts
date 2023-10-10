import { useCallback } from 'react'

import { getQuoteUnsupportedToken } from '@cowprotocol/common-utils'
import { useAddUnsupportedToken } from '@cowprotocol/tokens'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export function useProcessUnsupportedTokenError() {
  const addGpUnsupportedToken = useAddUnsupportedToken()

  return useCallback(
    (error: GpQuoteError, quoteParams: { sellToken: string; buyToken: string }) => {
      const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteParams)

      if (unsupportedTokenAddress) {
        addGpUnsupportedToken(unsupportedTokenAddress)
      }
    },
    [addGpUnsupportedToken]
  )
}
