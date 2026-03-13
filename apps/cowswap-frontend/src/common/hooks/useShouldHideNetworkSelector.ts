import { useIsRabbyWallet, useIsSafeApp, useIsSafeViaWc } from '@cowprotocol/wallet'

export function useShouldHideNetworkSelector(): boolean {
  const isSafeApp = useIsSafeApp()
  const isSafeViaWc = useIsSafeViaWc()
  const isRabbyWallet = useIsRabbyWallet()

  if (isRabbyWallet) return false

  return isSafeViaWc || isSafeApp
}
