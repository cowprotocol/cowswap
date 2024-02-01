import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SafeInfoResponse } from '@safe-global/api-kit'

export enum ConnectionType {
  INJECTED = 'INJECTED',
  INJECTED_WIDGET = 'INJECTED_WIDGET',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT_V2 = 'WALLET_CONNECT_V2',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  ZENGO = 'ZENGO',
  AMBIRE = 'AMBIRE',
  ALPHA = 'ALPHA',
  TALLY = 'TALLY',
  TRUST = 'TRUST',
  // LEDGER = 'LEDGER',
  KEYSTONE = 'KEYSTONE',
  TREZOR = 'TREZOR',
}

export const BACKFILLABLE_WALLETS = [ConnectionType.INJECTED]

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

  // Feature Support
  allowsOffchainSigning: boolean
}

export type GnosisSafeInfo = SafeInfoResponse & { isReadOnly?: boolean }

export enum WalletType {
  SAFE,
  SC,
  EOA,
}
