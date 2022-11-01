import { Currency } from '@uniswap/sdk-core'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

export function getAddress(currency: Currency): string | null {
  if (!currency || currency.isNative) {
    return null
  }

  return currency?.address || (currency as WrappedTokenInfo)?.tokenInfo?.address || null
}
