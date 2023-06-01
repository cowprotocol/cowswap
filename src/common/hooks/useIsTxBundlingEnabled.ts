import { useIsBundlingSupported } from 'modules/wallet'

import { useFeatureFlags } from 'common/hooks/useFeatureFlags'

export function useIsTxBundlingEnabled(): boolean {
  const isBundlingSupported = useIsBundlingSupported()

  const { txBundlingEnabled } = useFeatureFlags()

  return isBundlingSupported && txBundlingEnabled
}
