import { Currency } from '@cowprotocol/currency'

import { getCurrencyAddress } from './getCurrencyAddress'

// Use for analytics/logging labels; falls back to address when symbol is missing.
export function getTokenLabel(currency: Currency, addressFallback?: string): string {
  const symbol = normalizeTokenSymbol(currency)
  return symbol || addressFallback || getCurrencyAddress(currency)
}

export function normalizeTokenSymbol(currency: Currency): string {
  return currency.symbol ? currency.symbol.toLowerCase() : ''
}
