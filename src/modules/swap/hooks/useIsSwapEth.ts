import { useDetectNativeToken } from './useDetectNativeToken'

import { useIsWrapOrUnwrap } from '../../trade/hooks/useIsWrapOrUnwrap'

export function useIsSwapEth(): boolean {
  const { isNativeIn } = useDetectNativeToken()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  return isNativeIn && !isWrapOrUnwrap
}
