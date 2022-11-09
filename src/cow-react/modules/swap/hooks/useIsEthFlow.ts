import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { getEthFlowEnabled } from '@cow/modules/swap/helpers/getEthFlowEnabled'

export function useIsEthFlow(): boolean {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()
  const isEnabled = getEthFlowEnabled()

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}
