import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

/**
 * Custom hook to get USD value for either a string amount or a CurrencyAmount object
 *
 * @param amount - Either a string amount to parse or an already parsed CurrencyAmount
 * @param token - The token associated with the amount
 * @returns An object containing the parsed currency amount and its USD value
 *
 * This hook optimizes performance by:
 * 1. Accepting already parsed CurrencyAmount objects to avoid redundant parsing
 * 2. Memoizing the parsing operation to prevent unnecessary recalculations
 * 3. Leveraging the useUsdAmount hook for USD conversion
 */
export function useParsedAmountWithUsd(
  amount?: string | CurrencyAmount<TokenWithLogo>,
  token?: TokenWithLogo,
): { currencyAmount?: CurrencyAmount<TokenWithLogo>; usdInfo: UsdAmountInfo } {
  // Only parse the amount if it's a string and only when inputs change
  const currencyAmount = useMemo(() => {
    if (!amount || !token) return undefined

    // If we already have a CurrencyAmount, just use it
    if (typeof amount !== 'string') return amount

    // Otherwise, parse the string into a CurrencyAmount
    return tryParseCurrencyAmount(amount, token)
  }, [amount, token])

  const usdInfo = useUsdAmount(currencyAmount, token)

  return { currencyAmount, usdInfo }
}
