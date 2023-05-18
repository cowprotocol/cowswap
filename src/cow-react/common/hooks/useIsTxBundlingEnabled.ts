import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'
import { useIsSafeApp } from '@cow/modules/wallet'

export function useIsTxBundlingEnabled(): boolean {
  // For now, bundling can only be performed while the App is loaded as a Safe App
  // Pending a custom RPC endpoint implementation on Safe side to allow
  // tx bundling via WalletConnect
  const isSafeApp = useIsSafeApp()
  const { txBundlingEnabled } = useFeatureFlags()

  return isSafeApp && txBundlingEnabled
}
