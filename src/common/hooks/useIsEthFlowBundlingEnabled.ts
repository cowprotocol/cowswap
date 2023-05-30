import { useFeatureFlags } from 'common/hooks/useFeatureFlags'

import { useIsBundlingSupported } from './useIsBundlingSupported'

export function useIsEthFlowBundlingEnabled(): boolean {
  const isBundlingSupported = useIsBundlingSupported()

  const { ethFlowBundlingEnabled } = useFeatureFlags()

  return isBundlingSupported && ethFlowBundlingEnabled
}
