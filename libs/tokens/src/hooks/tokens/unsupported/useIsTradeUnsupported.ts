import { Currency } from '@uniswap/sdk-core'
import { getAddress } from '@cowprotocol/common-utils'
import { useAreUnsupportedTokens } from './useAreUnsupportedTokens'

type NullishCurrency = Currency | null | undefined

export function useIsTradeUnsupported(inputCurrency: NullishCurrency, outputCurrency: NullishCurrency): boolean {
  const areUnsupportedTokens = useAreUnsupportedTokens()

  return areUnsupportedTokens({ sellToken: getAddress(inputCurrency), buyToken: getAddress(outputCurrency) })
}
