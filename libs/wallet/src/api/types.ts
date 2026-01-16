import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SafeInfoResponse } from '@safe-global/api-kit'

import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors'
import { Address } from 'viem'

export const ConnectorType = {
  COINBASE_WALLET: coinbaseWallet.type,
  INJECTED: injected.type,
  WALLET_CONNECT: walletConnect.type,
} as const

export type ConnectorType = (typeof ConnectorType)[keyof typeof ConnectorType]

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
  account?: Address
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
