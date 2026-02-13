import { useIsCoinbaseWallet, useIsRabbyWallet, useIsSafeViaWc, useIsSmartContractWallet } from '@cowprotocol/wallet'

export function useShouldHideNetworkSelector(): boolean {
  const isSmartContractWallet = useIsSmartContractWallet()
  const isSafeViaWc = useIsSafeViaWc()
  const isRabbyWallet = useIsRabbyWallet()
  const isCoinbaseWallet = useIsCoinbaseWallet()

  if (isRabbyWallet) return false

  // Coinbase SCW is multi-chain — show the selector.
  // Other SCWs (Safe, unknown) keep the hidden selector.
  if (isSmartContractWallet && isCoinbaseWallet) return false

  return isSmartContractWallet || isSafeViaWc
}
