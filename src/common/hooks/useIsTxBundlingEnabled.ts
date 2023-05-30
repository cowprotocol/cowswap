import { useFeatureFlags } from 'common/hooks/useFeatureFlags'

import { useIsBundlingSupported } from './useIsBundlingSupported'

export function useIsTxBundlingEnabled(): boolean {
  const isBundlingSupported = useIsBundlingSupported()

  const { txBundlingEnabled } = useFeatureFlags()

  return isBundlingSupported && txBundlingEnabled
}
