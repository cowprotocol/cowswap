import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'
import { getCurrencyAddress } from './getCurrencyAddress'

export function getIsWrapOrUnwrap(
  chainId: SupportedChainId,
  inputCurrency: Nullish<Currency>,
  outputCurrency: Nullish<Currency>,
): boolean {
  if (!inputCurrency || !outputCurrency) return false
  if (inputCurrency.chainId !== outputCurrency.chainId) return false

  const inputCurrencyId = getCurrencyAddress(inputCurrency)
  const outputCurrencyId = getCurrencyAddress(outputCurrency)

  const nativeToken = NATIVE_CURRENCIES[chainId]
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]

  const isNativeIn = doesTokenMatchSymbolOrAddress(nativeToken, inputCurrencyId)
  const isNativeOut = doesTokenMatchSymbolOrAddress(nativeToken, outputCurrencyId)

  const isWrappedIn = doesTokenMatchSymbolOrAddress(wrappedToken, inputCurrencyId)
  const isWrappedOut = doesTokenMatchSymbolOrAddress(wrappedToken, outputCurrencyId)

  return (isNativeIn && isWrappedOut) || (isNativeOut && isWrappedIn)
}
