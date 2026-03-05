import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { Currency } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

export function getCurrencyAddress(currency: Currency): string {
  return getIsNativeToken(currency) ? NATIVE_CURRENCY_ADDRESS : currency.address
}
