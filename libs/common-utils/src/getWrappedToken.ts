import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { Currency } from '@cowprotocol/common-entities'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getIsNativeToken } from './getIsNativeToken'

export function getWrappedToken(currency: Currency): TokenWithLogo {
  return getIsNativeToken(currency)
    ? WRAPPED_NATIVE_CURRENCIES[currency.chainId as SupportedChainId]
    : (currency as TokenWithLogo)
}
