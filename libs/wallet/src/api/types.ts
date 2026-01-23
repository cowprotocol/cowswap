import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SafeInfo } from '@safe-global/safe-apps-sdk'

import { injected, walletConnect, coinbaseWallet, safe } from '@wagmi/connectors'
import { Address } from 'viem'

export const ConnectorType = {
  COINBASE_WALLET: coinbaseWallet.type,
  GNOSIS_SAFE: safe.type,
  INJECTED: injected.type,
  WALLET_CONNECT_V2: walletConnect.type,
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

export type GnosisSafeInfo = Omit<SafeInfo, 'safeAddress'> & {
  address: string
  nonce: number
}

export enum WalletType {
  SAFE,
  SC,
  EOA,
}
