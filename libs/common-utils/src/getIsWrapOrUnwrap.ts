import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

export function getIsWrapOrUnwrap(
  chainId: SupportedChainId,
  inputCurrencyId: Nullish<string>,
  outputCurrencyId: Nullish<string>,
): boolean {
  if (!inputCurrencyId || !outputCurrencyId) return false

  const nativeToken = NATIVE_CURRENCIES[chainId]
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]

  const isNativeIn = doesTokenMatchSymbolOrAddress(nativeToken, inputCurrencyId)
  const isNativeOut = doesTokenMatchSymbolOrAddress(nativeToken, outputCurrencyId)

  const isWrappedIn = doesTokenMatchSymbolOrAddress(wrappedToken, inputCurrencyId)
  const isWrappedOut = doesTokenMatchSymbolOrAddress(wrappedToken, outputCurrencyId)

  return (isNativeIn && isWrappedOut) || (isNativeOut && isWrappedIn)
}
