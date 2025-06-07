import { useCallback } from 'react'

import { getQuoteUnsupportedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddUnsupportedToken } from '@cowprotocol/tokens'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useProcessUnsupportedTokenError() {
  const addGpUnsupportedToken = useAddUnsupportedToken()

  return useCallback(
    (
      error: QuoteApiError,
      chainId: SupportedChainId,
      quoteParams: { sellTokenAddress: string | null; buyTokenAddress: string | null },
    ) => {
      const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteParams)

      if (unsupportedTokenAddress) {
        addGpUnsupportedToken(chainId, unsupportedTokenAddress)
      }
    },
    [addGpUnsupportedToken],
  )
}
