import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import type { SafeInfoResponse } from '@safe-global/api-kit'

import { Address, EIP1193Provider, PublicClient } from 'viem'
import { Connector as WagmiConnector } from 'wagmi'
import { injected, walletConnect, coinbaseWallet, safe } from 'wagmi/connectors'

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
  connector?: WagmiConnector
  provider?: EIP1193Provider | WidgetEthereumProvider | PublicClient
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
