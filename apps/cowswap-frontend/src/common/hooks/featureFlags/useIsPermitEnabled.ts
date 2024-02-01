import { useIsSmartContractWallet } from '@cowprotocol/wallet'

export function useIsPermitEnabled(): boolean {
  // Permit is only available for EOAs
  return useIsSmartContractWallet() === false
}
