import { useIsSwapEth } from './useIsSwapEth'

import { useIsEthFlowBundlingEnabled } from '../../../common/hooks/useIsEthFlowBundlingEnabled'

export function useIsSafeEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()
  const isEthFlowBundlingEnabled = useIsEthFlowBundlingEnabled()

  return isEthFlowBundlingEnabled && isSwapEth
}
