import { useMemo } from 'react'

import { useTradeState } from 'modules/trade/hooks/useTradeState'

import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'

import { useNativeCurrency } from './useNativeCurrency'

export function useDetectNativeToken() {
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  const input = useTokenBySymbolOrAddress(inputCurrencyId)
  const output = useTokenBySymbolOrAddress(outputCurrencyId)

  const native = useNativeCurrency()
  const wrappedToken = native.wrapped

  return useMemo(() => {
    const [isNativeIn, isNativeOut] = [!!input?.isNative, !!output?.isNative]
    const [isWrappedIn, isWrappedOut] = [!!input?.equals(wrappedToken), !!output?.equals(wrappedToken)]

    return {
      isNativeIn,
      isNativeOut,
      isWrappedIn,
      isWrappedOut,
      wrappedToken,
      native,
    }
  }, [input, output, wrappedToken, native])
}
