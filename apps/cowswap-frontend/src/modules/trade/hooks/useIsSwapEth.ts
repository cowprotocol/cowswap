import { useIsNativeIn } from './useIsNativeInOrOut'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

export function useIsSwapEth(): boolean {
  const isNativeIn = useIsNativeIn()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  return isNativeIn && !isWrapOrUnwrap
}
