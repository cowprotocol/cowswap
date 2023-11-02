import { useIsSmartContractWallet } from '@cowprotocol/wallet'

export function useIsPermitEnabled(): boolean {
  const isSmartContractWallet = useIsSmartContractWallet()

  // Permit is only available for EOAs
  return !isSmartContractWallet
}
