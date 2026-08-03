import { useIsSafeApp, useIsSafeViaWc } from '../../wagmi/hooks/useWalletMetadata'
import { useIsRabbyWallet } from '../hooks'

export function useNetworkSwitchUnsupported(): boolean {
  const isSafeApp = useIsSafeApp()
  const isSafeViaWc = useIsSafeViaWc()
  const isRabbyWallet = useIsRabbyWallet()

  if (isRabbyWallet) return false

  return isSafeViaWc || isSafeApp
}
