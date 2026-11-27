import { getWrappedToken } from '@cowprotocol/common-utils'
import type { Currency } from '@cowprotocol/currency'

export function currenciesMatch(currency: Currency, other: Currency): boolean {
  return getWrappedToken(currency).equals(getWrappedToken(other))
}

export function getPairInversion(base: Currency, quote: Currency, input: Currency, output: Currency): boolean | null {
  if (currenciesMatch(base, input) && currenciesMatch(quote, output)) return false
  if (currenciesMatch(base, output) && currenciesMatch(quote, input)) return true
  return null
}
