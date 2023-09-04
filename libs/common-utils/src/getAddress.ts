import { Currency } from '@uniswap/sdk-core'

import { WrappedTokenInfo } from 'legacy/state/lists/wrappedTokenInfo'

export function getAddress(currency: Currency | null | undefined): string | null {
  if (!currency || currency.isNative) {
    return null
  }

  return currency?.address || (currency as WrappedTokenInfo)?.tokenInfo?.address || null
}
