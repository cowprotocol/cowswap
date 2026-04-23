import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isSupportedChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { getIsNativeToken } from './getIsNativeToken'

export function getWrappedToken(currency: Currency): TokenWithLogo {
  return getIsNativeToken(currency) && isSupportedChain(currency.chainId)
    ? WRAPPED_NATIVE_CURRENCIES[currency.chainId]
    : (currency as TokenWithLogo)
}
