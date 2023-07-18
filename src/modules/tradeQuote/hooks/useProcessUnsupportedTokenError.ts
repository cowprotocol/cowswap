import { useCallback } from 'react'

import { useAddGpUnsupportedToken } from 'legacy/state/lists/hooks'

import { useWalletInfo } from 'modules/wallet'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'
import { getQuoteUnsupportedToken } from 'utils/getQuoteUnsupportedToken'

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
