import { useIsEthFlowBundlingEnabled } from 'common/hooks/featureFlags/useIsEthFlowBundlingEnabled'

import { useIsSwapEth } from './useIsSwapEth'

export function useIsSafeEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()
  const isEthFlowBundlingEnabled = useIsEthFlowBundlingEnabled()

  return isEthFlowBundlingEnabled && isSwapEth
}
