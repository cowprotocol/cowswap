import { Currency } from '@uniswap/sdk-core'
import { TokenWithLogo, WRAPPED_NATIVE_CURRENCY } from '@cowprotocol/common-const'
import { getIsNativeToken } from './getIsNativeToken'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getWrappedToken(currency: Currency): TokenWithLogo {
  return getIsNativeToken(currency)
    ? WRAPPED_NATIVE_CURRENCY[currency.chainId as SupportedChainId]
    : (currency as TokenWithLogo)
}
