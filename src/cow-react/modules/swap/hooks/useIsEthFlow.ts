import { useDetectNativeToken } from 'state/swap/hooks'

export function useIsEthFlow(): boolean {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()

  return isNativeIn && !isWrapOrUnwrap
}
