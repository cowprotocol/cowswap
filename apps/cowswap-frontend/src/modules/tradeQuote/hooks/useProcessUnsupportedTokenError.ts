import { useCallback } from 'react'

import { getQuoteUnsupportedToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAddGpUnsupportedToken } from 'legacy/state/lists/hooks'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export function useProcessUnsupportedTokenError() {
  const { chainId } = useWalletInfo()
  const addGpUnsupportedToken = useAddGpUnsupportedToken()

  return useCallback(
    (error: GpQuoteError, quoteParams: { sellToken: string; buyToken: string }) => {
      const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteParams)

      if (unsupportedTokenAddress) {
        addGpUnsupportedToken({
          chainId,
          dateAdded: Date.now(),
          address: unsupportedTokenAddress || '',
        })
      }
    },
    [chainId, addGpUnsupportedToken]
  )
}
