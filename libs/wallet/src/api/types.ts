import { Address } from 'viem'
import { injected, walletConnect, coinbaseWallet, safe } from 'wagmi/connectors'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SafeInfoResponse } from '@safe-global/api-kit'

export const ConnectionType = {
  COINBASE_WALLET: coinbaseWallet.type,
  GNOSIS_SAFE: safe.type,
  INJECTED: injected.type,
  WALLET_CONNECT_V2: walletConnect.type,
} as const
export type ConnectionType = (typeof ConnectionType)[keyof typeof ConnectionType]

export type GnosisSafeInfo = Pick<SafeInfoResponse, 'address' | 'threshold' | 'owners'> & {
  isReadOnly?: boolean
  chainId: number
  nonce: number
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

export interface WalletInfo {
  chainId: SupportedChainId
  account?: Address
  active?: boolean
  isConnectionRestoring?: boolean
}

export enum WalletType {
  SAFE,
  SC,
  EOA,
}
