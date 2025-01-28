import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SafeInfoResponse } from '@safe-global/api-kit'

export interface WalletInfo {
  chainId: SupportedChainId
  account?: string
  active?: boolean
}

export interface WalletDetails {
  // Account details
  isSmartContractWallet: boolean | undefined
  ensName?: string

  // Provider details
  walletName?: string
  icon?: string
  isSupportedWallet: boolean
  isSafeApp: boolean

  // Feature Support
  allowsOffchainSigning: boolean
}

export type GnosisSafeInfo = Pick<SafeInfoResponse, 'address' | 'threshold' | 'owners' | 'nonce'> & {
  isReadOnly?: boolean
  chainId: number
}
