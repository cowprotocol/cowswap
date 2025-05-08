import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Configuration for a bridge protocol
 */
export interface BridgeProtocolConfig {
  icon: string
  title: string
  url: string
  description: string
}

/**
 * Enum for bridge fee types
 */
export enum BridgeFeeType {
  FREE = 'FREE',
}

/**
 * Interface for bridge data structure
 */
export interface BridgeData {
  // Swap details
  sellAmount: string
  sellToken: string
  sellTokenAddress: string
  buyAmount: string
  buyToken: string
  buyTokenAddress: string
  networkCost: string
  networkCostUsd: string
  swapMinReceive: string
  swapExpectedToReceive: string
  swapMaxSlippage: string

  // Bridge details
  bridgeAmount: string
  bridgeToken: string
  bridgeTokenAddress: string
  bridgeTokenReceiveAddress: string
  bridgeReceiveAmount: string
  bridgeFee: string | BridgeFeeType
  maxBridgeSlippage: string
  estimatedTime: number
  recipient: string
  recipientChainId: SupportedChainId
  sourceChainId: SupportedChainId

  // Bridge provider info
  bridgeProvider: BridgeProtocolConfig
}
