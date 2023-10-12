import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_TOKEN, WRAPPED_NATIVE_TOKEN } from '@cowprotocol/common-const'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

import { Nullish } from './types'

export function getIsWrapOrUnwrap(
  chainId: SupportedChainId,
  inputCurrencyId: Nullish<string>,
  outputCurrencyId: Nullish<string>
): boolean {
  if (!inputCurrencyId || !outputCurrencyId) return false

  const nativeToken = NATIVE_TOKEN[chainId]
  const wrappedToken = WRAPPED_NATIVE_TOKEN[chainId]

  const isNativeIn = doesTokenMatchSymbolOrAddress(nativeToken, inputCurrencyId)
  const isNativeOut = doesTokenMatchSymbolOrAddress(nativeToken, outputCurrencyId)

  const isWrappedIn = doesTokenMatchSymbolOrAddress(wrappedToken, inputCurrencyId)
  const isWrappedOut = doesTokenMatchSymbolOrAddress(wrappedToken, outputCurrencyId)

  return (isNativeIn && isWrappedOut) || (isNativeOut && isWrappedIn)
}
