import { Currency /* , Token */ } from '@uniswap/sdk-core'
// import { useMemo } from 'react'

import { useIsUnsupportedToken } from 'state/lists/hooks'

/**
 * Returns true if the input currency or output currency cannot be traded in the interface
 * @param currencyIn the input currency to check
 * @param currencyOut the output currency to check
 */
export function useIsSwapUnsupported(currencyIn?: Currency | null, currencyOut?: Currency | null): boolean {
  const isUnsupported = useIsUnsupportedToken()

  const tokenIn = currencyIn?.wrapped
  const tokenOut = currencyOut?.wrapped

  /* const unsupportedTokens = useUnsupportedTokens()
  return useMemo(() => {
    if (!unsupportedTokens) {
      return false
    }
    const currencyInUnsupported = Boolean(currencyIn?.isToken && unsupportedTokens[currencyIn.address])
    const currencyOutUnsupported = Boolean(currencyOut?.isToken && unsupportedTokens[currencyOut.address])
    return currencyInUnsupported || currencyOutUnsupported
  }, [currencyIn, currencyOut, unsupportedTokens]) */

  return isUnsupported(tokenIn?.address) || isUnsupported(tokenOut?.address)
}
