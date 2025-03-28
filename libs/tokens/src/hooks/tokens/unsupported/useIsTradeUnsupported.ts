import { getAddress } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

import { useAreUnsupportedTokens } from './useAreUnsupportedTokens'

type NullishCurrency = Currency | null | undefined

export function useIsTradeUnsupported(inputCurrency: NullishCurrency, outputCurrency: NullishCurrency): boolean {
  const areUnsupportedTokens = useAreUnsupportedTokens()

  return areUnsupportedTokens({
    sellTokenAddress: getAddress(inputCurrency),
    buyTokenAddress: getAddress(outputCurrency),
  })
}
