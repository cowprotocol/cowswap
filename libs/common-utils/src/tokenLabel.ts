import { Currency } from '@uniswap/sdk-core'

import { getCurrencyAddress } from './getCurrencyAddress'

export function normalizeTokenSymbol(currency: Currency): string {
  return currency.symbol ? currency.symbol.toLowerCase() : ''
}

// Use for analytics/logging labels; falls back to address when symbol is missing.
export function getTokenLabel(currency: Currency, addressFallback?: string): string {
  const symbol = normalizeTokenSymbol(currency)
  return symbol || addressFallback || getCurrencyAddress(currency)
}
