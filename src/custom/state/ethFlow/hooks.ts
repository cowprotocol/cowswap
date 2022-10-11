import { useDetectNativeToken } from '../swap/hooks'

export function useShowNativeEthFlowSlippageWarning() {
  const { isNativeIn, isWrapOrUnwrap, native } = useDetectNativeToken()

  return { showWarning: isNativeIn && !isWrapOrUnwrap, native }
}
