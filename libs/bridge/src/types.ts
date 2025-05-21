import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Configuration for a bridge protocol provider (e.g., Bungee)
 */
export interface BridgeProtocolConfig {
  icon: string // Path or identifier for the logo/icon asset (e.g., from @cowprotocol/assets)
  title: string // Display name, e.g., "Bungee Exchange"
  url: string // Homepage URL of the bridge provider
  description: string // Short description of the provider
}

export enum BridgeStatus {
  Pending = 'pending',
  InProgress = 'inProgress',
  Completed = 'completed',
  Failed = 'failed',
  Refunding = 'refunding',
  RefundComplete = 'refundComplete',
  Unknown = 'unknown',
}

export interface BridgeableToken {
  address: string
  chainId: SupportedChainId
  symbol?: string
  decimals?: number
}

export interface BridgeDetails {
  providerName: string // This will come from BridgeProtocolConfig.title via BRIDGE_PROVIDER_DETAILS
  providerUrl?: string
  isSuccess: boolean
  status: BridgeStatus
  bridgeQuoteTimestamp?: number
  expectedFillTimeSeconds?: number
  source: BridgeableToken
  destination: BridgeableToken
  inputAmount: string
  outputAmount?: string
  gasCostsNative?: string
  protocolFeeSellToken?: string
  protocolFeeBuyToken?: string
  maxSlippageBps?: number
  sourceChainTransactionHash?: string
  destinationChainTransactionHash?: string
  explorerUrl?: string
  minDepositAmount?: string
  maxDepositAmount?: string
}
