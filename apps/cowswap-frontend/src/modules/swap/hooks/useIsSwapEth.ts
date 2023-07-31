import { useIsNativeIn } from '../../trade/hooks/useIsNativeInOrOut'
import { useIsWrapOrUnwrap } from '../../trade/hooks/useIsWrapOrUnwrap'

export function useIsSwapEth(): boolean {
  const isNativeIn = useIsNativeIn()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  return isNativeIn && !isWrapOrUnwrap
}
