import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SafeInfoResponse } from '@safe-global/api-kit'

import { injected, walletConnect, coinbaseWallet, safe } from '@wagmi/connectors'
import { Address } from 'viem'

export const ConnectionType = {
  COINBASE_WALLET: coinbaseWallet.type,
  GNOSIS_SAFE: safe.type,
  INJECTED: injected.type,
  WALLET_CONNECT_V2: walletConnect.type,
} as const
export type ConnectionType = (typeof ConnectionType)[keyof typeof ConnectionType]

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

export type GnosisSafeInfo = Pick<SafeInfoResponse, 'address' | 'threshold' | 'owners'> & {
  isReadOnly?: boolean
  chainId: number
  nonce: number
}

export enum WalletType {
  SAFE,
  SC,
  EOA,
}
