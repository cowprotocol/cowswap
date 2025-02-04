import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SafeInfoResponse } from '@safe-global/api-kit'

export enum ConnectionType {
  NETWORK = 'NETWORK',
  INJECTED = 'INJECTED',
  WALLET_CONNECT_V2 = 'WALLET_CONNECT_V2',
  COINBASE_WALLET = 'COINBASE_WALLET',
  METAMASK = 'METAMASK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  TREZOR = 'TREZOR',
}

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

export enum WalletType {
  SAFE,
  SC,
  EOA,
}
