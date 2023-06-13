import { useIsBundlingSupported } from 'modules/wallet'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

export function useIsEthFlowBundlingEnabled(): boolean {
  const isBundlingSupported = useIsBundlingSupported()

  const { ethFlowBundlingEnabled } = useFeatureFlags()

  return isBundlingSupported && ethFlowBundlingEnabled
}
