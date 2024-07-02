import { Currency } from '@uniswap/sdk-core'

import { getIsNativeToken } from './getIsNativeToken'

/**
 * @deprecated use getCurrencyAddress() instead
 * @param currency
 */
export function getAddress(currency: Currency | null | undefined): string | null {
  if (!currency || getIsNativeToken(currency)) {
    return null
  }

  return currency.address
}
