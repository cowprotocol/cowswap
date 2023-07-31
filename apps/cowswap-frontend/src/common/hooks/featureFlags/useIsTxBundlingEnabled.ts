import { useIsBundlingSupported } from '../../../modules/wallet'

import { useFeatureFlags } from './useFeatureFlags'

export function useIsTxBundlingEnabled(): boolean {
  const isBundlingSupported = useIsBundlingSupported()

  const { txBundlingEnabled } = useFeatureFlags()

  return isBundlingSupported && txBundlingEnabled
}
