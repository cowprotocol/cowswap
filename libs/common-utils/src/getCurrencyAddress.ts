import { NATIVE_CURRENCIES, NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { TargetChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

export function getCurrencyAddress(currency: Currency): string {
  return getIsNativeToken(currency)
    ? (NATIVE_CURRENCIES[currency.chainId as TargetChainId].address ?? NATIVE_CURRENCY_ADDRESS)
    : currency.address
}
