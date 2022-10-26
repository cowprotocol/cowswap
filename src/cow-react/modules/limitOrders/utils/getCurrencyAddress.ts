import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

export function getCurrencyAddress(currency: WrappedTokenInfo): string | null {
  return currency?.address || currency?.tokenInfo?.address || null
}
