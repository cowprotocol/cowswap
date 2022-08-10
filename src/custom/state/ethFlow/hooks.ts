import { useAtomValue } from 'jotai/utils'
import { isUserNativeEthFlow } from './atoms'

export function useIsUserNativeEthFlow() {
  return useAtomValue(isUserNativeEthFlow)
}
