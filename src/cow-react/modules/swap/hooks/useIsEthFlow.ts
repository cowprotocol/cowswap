import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'

export function useIsEthFlow(): boolean {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()

  return isNativeIn && !isWrapOrUnwrap
}
