import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

export function useIsSwapEth(): boolean {
  const isNativeIn = useIsNativeIn()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  return isNativeIn && !isWrapOrUnwrap
}
