import { useDetectNativeToken } from '../swap/hooks'

export function useShowNativeEthFlowSlippageWarning() {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()

  return isNativeIn && !isWrapOrUnwrap
}
