import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'

export function isWrappingTrade(
  sellCurrency: Currency | null | undefined,
  buyCurrency: Currency | null | undefined,
  chainId?: SupportedChainId
): boolean {
  if (!chainId) return false

  const wethByChain = WRAPPED_NATIVE_CURRENCY[chainId]

  return Boolean(
    (sellCurrency?.isNative && buyCurrency?.wrapped.equals(wethByChain)) ||
      (buyCurrency?.isNative && sellCurrency?.wrapped.equals(wethByChain))
  )
}
