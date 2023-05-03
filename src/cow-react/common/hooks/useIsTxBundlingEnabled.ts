import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'
import { useGnosisSafeInfo } from '@cow/modules/wallet'

export function useIsTxBundlingEnabled(): boolean {
  const safeInfo = useGnosisSafeInfo()
  const { txBundlingEnabled } = useFeatureFlags()

  return safeInfo && !safeInfo.isReadOnly && txBundlingEnabled
}
