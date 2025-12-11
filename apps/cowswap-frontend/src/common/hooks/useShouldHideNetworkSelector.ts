import { useIsRabbyWallet, useIsSafeViaWc, useIsSmartContractWallet } from '@cowprotocol/wallet'

export function useShouldHideNetworkSelector(): boolean {
  const isSafeViaWc = useIsSafeViaWc()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isRabbyWallet = useIsRabbyWallet()

  return (!!isSmartContractWallet && !isRabbyWallet) || isSafeViaWc
}
