import { useDetectNativeToken } from 'state/swap/hooks'

export function useIsEthFlow() {
  const { isNativeIn, isWrapOrUnwrap, native } = useDetectNativeToken()

  return { isEthFlow: isNativeIn && !isWrapOrUnwrap, nativeCurrency: native }
}
