import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'
import { useIsSafeWallet } from '@cow/modules/wallet'

export function useIsTxBundlingEnabled(): boolean {
  const isSafeWallet = useIsSafeWallet()
  const { txBundlingEnabled } = useFeatureFlags()

  return isSafeWallet && txBundlingEnabled
}
