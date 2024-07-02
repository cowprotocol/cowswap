import { TokenWithLogo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import { getIsNativeToken } from './getIsNativeToken'


export function getWrappedToken(currency: Currency): TokenWithLogo {
  return getIsNativeToken(currency)
    ? WRAPPED_NATIVE_CURRENCIES[currency.chainId as SupportedChainId]
    : (currency as TokenWithLogo)
}
