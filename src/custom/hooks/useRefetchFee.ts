import { useCallback } from 'react'
import { useAddFee, useClearFee } from '../state/fee/hooks'
import { registerOnWindow } from '../utils/misc'
import { FeeQuoteParams, getFeeQuote } from '../utils/operator'

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchFeeCallback() {
  const addFee = useAddFee()
  const clearFee = useClearFee()
  registerOnWindow({ addFee })

  return useCallback(
    async ({ sellToken, buyToken, amount, kind, chainId }: FeeQuoteParams) => {
      // Get a new quote
      const fee = await getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(err => {
        console.error(new Error(err))
        return null
      })

      if (fee) {
        // Update quote
        addFee({ sellToken, buyToken, amount, fee, chainId })
      } else {
        // Clear the fee
        clearFee({ chainId, token: sellToken })
      }
    },
    [addFee, clearFee]
  )
}
