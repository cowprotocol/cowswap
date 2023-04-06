import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  FORTMATIC = 'FORTMATIC',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  ZENGO = 'ZENGO',
  AMBIRE = 'AMBIRE',
  ALPHA = 'ALPHA',
  LEDGER = 'LEDGER',
  KEYSTONE = 'KEYSTONE',
}

export const BACKFILLABLE_WALLETS = [ConnectionType.INJECTED, ConnectionType.WALLET_CONNECT]

export interface WalletInfo {
  chainId?: number
  account?: string
  active?: boolean
}

export interface WalletDetails {
  // Account details
  isSmartContractWallet: boolean
  ensName?: string

  // Provider details
  walletName?: string
  icon?: string
  isSupportedWallet: boolean

  // Feature Support
  allowsOffchainSigning: boolean
}

export type GnosisSafeInfo = SafeInfoResponse & { isReadOnly?: boolean }
