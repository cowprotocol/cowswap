import { useMemo } from 'react'

import { useIsNativeIn, useIsNativeOut } from './useIsNative'
import { useIsWrappedIn, useIsWrappedOut } from './useIsWrapped'
import { useNativeCurrency } from './useNativeCurrency'

export function useNativeTokenContext() {
  const native = useNativeCurrency()
  const wrappedToken = native.wrapped

  const isNativeIn = useIsNativeIn()
  const isNativeOut = useIsNativeOut()

  const isWrappedIn = useIsWrappedIn()
  const isWrappedOut = useIsWrappedOut()

  return useMemo(() => {
    return {
      isNativeIn,
      isNativeOut,
      isWrappedIn,
      isWrappedOut,
      wrappedToken,
      native,
    }
  }, [isNativeIn, isNativeOut, isWrappedIn, isWrappedOut, wrappedToken, native])
}
