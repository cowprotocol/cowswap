import { AccountType } from '@cowprotocol/types'

interface ShouldRestrictStandardBridgeProvidersParams {
  accountType: AccountType | undefined
  isSmartContractWallet: boolean | undefined
}

export function shouldRestrictStandardBridgeProviders({
  accountType,
  isSmartContractWallet,
}: ShouldRestrictStandardBridgeProvidersParams): boolean {
  // EIP-7702 accounts should keep the MetaMask/EOA UI flow, but bridge-provider
  // availability must still stay restricted until the delegate guarantees EIP-1271.
  if (accountType === AccountType.EIP7702EOA) {
    return true
  }

  return isSmartContractWallet === true
}
