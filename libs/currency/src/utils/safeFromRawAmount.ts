import { CurrencyAmount } from '../entities/fractions/currencyAmount'

import type { BigintIsh } from '../entities/constants'
import type { Currency } from '../entities/currency'

/**
 * Builds CurrencyAmount from raw amount; returns undefined if the value is invalid
 * (e.g. exceeds MaxUint256) instead of throwing, so callers can handle invalid data safely.
 */
export function safeFromRawAmount<T extends Currency>(
  currency: T,
  rawAmount: BigintIsh,
): CurrencyAmount<T> | undefined {
  try {
    return CurrencyAmount.fromRawAmount(currency, rawAmount)
  } catch {
    return undefined
  }
}
