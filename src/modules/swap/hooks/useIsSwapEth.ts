import { useIsNativeIn } from '../../trade/hooks/useIsNative'
import { useIsWrapOrUnwrap } from '../../trade/hooks/useIsWrapOrUnwrap'

export function useIsSwapEth(): boolean {
  const isNativeIn = useIsNativeIn()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  return isNativeIn && !isWrapOrUnwrap
}
