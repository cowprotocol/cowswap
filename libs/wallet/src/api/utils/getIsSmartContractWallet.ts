import { AccountType } from '@cowprotocol/types'

import type { WalletCapabilities } from '../hooks/useWalletCapabilities'

interface GetIsSmartContractWalletParams {
  accountType: AccountType | undefined
  capabilities: WalletCapabilities | undefined
  capabilitiesLoading: boolean
  isSafeWallet: boolean
  shouldKeepEoaUnknownWhileCapabilitiesLoad: boolean
  shouldTreatAtomicCapabilitiesAsSmartWallet: boolean
}

// EIP-5792 atomic batching catches counterfactual ERC-4337 wallets such as Coinbase Smart Wallet.
function hasAtomicBatchSupport(capabilities: WalletCapabilities | undefined): boolean {
  const status = capabilities?.atomic?.status

  return status === 'supported' || status === 'ready'
}

export function getIsSmartContractWallet({
  accountType,
  capabilities,
  capabilitiesLoading,
  isSafeWallet,
  shouldKeepEoaUnknownWhileCapabilitiesLoad,
  shouldTreatAtomicCapabilitiesAsSmartWallet,
}: GetIsSmartContractWalletParams): boolean | undefined {
  if (isSafeWallet || accountType === AccountType.SMART_CONTRACT) {
    return true
  }

  // Preserve the #5735 MetaMask smart-account behavior: EIP-7702 accounts must stay
  // on the EOA path even if the wallet also exposes atomic capabilities.
  // Bridge availability is restricted separately via account-type checks because
  // delegate EIP-1271 support is a narrower concern than the general wallet UX path.
  if (accountType === AccountType.EIP7702EOA) {
    return false
  }

  // Keep the EIP-5792 fallback for non-MetaMask smart-wallet flows such as Coinbase
  // Smart Wallet, even if eth_getCode is still pending or temporarily unavailable.
  if (shouldTreatAtomicCapabilitiesAsSmartWallet && hasAtomicBatchSupport(capabilities)) {
    return true
  }

  if (accountType === undefined) {
    return undefined
  }

  // Coinbase Smart Wallet can resolve to a plain EOA before wallet_getCapabilities
  // reports atomic support. Keep that session unknown while capabilities are still
  // loading so we don't briefly enable EOA-only signing and permit flows.
  if (accountType === AccountType.EOA && capabilitiesLoading && shouldKeepEoaUnknownWhileCapabilitiesLoad) {
    return undefined
  }

  return false
}
