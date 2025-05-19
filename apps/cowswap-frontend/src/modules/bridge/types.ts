import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

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
  /** Indicates the bridge transaction is free. */
  FREE = 'FREE',
}

/**
 * Interface for bridge data structure
 * This structure holds all necessary details for displaying and executing a bridge transaction,
 * including the initial swap leg and the subsequent bridging leg.
 */
export interface BridgeData {
  // Swap details
  /** The amount of the token being sold in the swap portion of the bridge. */
  sellAmount: CurrencyAmount<TokenWithLogo>
  /** The symbol of the token being sold in the swap. e.g. "ETH" */
  sellToken: string
  /** The address of the token being sold in the swap. */
  sellTokenAddress: string
  /** The amount of the token being bought in the swap portion of the bridge. */
  buyAmount: CurrencyAmount<TokenWithLogo>
  /** The symbol of the token being bought in the swap. e.g. "USDC" */
  buyToken: string
  /** The address of the token being bought in the swap. */
  buyTokenAddress: string
  /** The estimated network cost for the swap portion, in the native currency of the source chain or the sell token. */
  networkCost: CurrencyAmount<TokenWithLogo>
  /** The USD equivalent of the network cost for the swap portion. e.g., "5.23" */
  networkCostUsd: string // TODO: Consider if this should also be CurrencyAmount<USDStablecoin> or derived
  /** The minimum amount expected to receive from the swap, after accounting for slippage and fees. May be undefined. */
  swapMinReceive?: CurrencyAmount<TokenWithLogo>
  /** The expected amount to receive from the swap before accounting for potential slippage beyond the estimate. May be undefined. */
  swapExpectedToReceive?: CurrencyAmount<TokenWithLogo>
  /** The maximum slippage allowed for the swap portion, as a percentage string. e.g., "0.5" for 0.5% */
  swapMaxSlippage: string

  // Bridge details
  /** The amount of token being sent to the bridge. This is typically the output of the swap portion (`buyAmount`). */
  bridgeAmount: CurrencyAmount<TokenWithLogo>
  /** The symbol of the token being bridged. e.g. "USDC" */
  bridgeToken: string // Often the same as buyToken from swap details
  /** The address of the token being bridged. */
  bridgeTokenAddress: string // Often the same as buyTokenAddress
  /** The address of the token to be received on the destination chain after bridging. */
  bridgeTokenReceiveAddress: string
  /** The amount of token expected to be received on the destination chain after bridging. */
  bridgeReceiveAmount: CurrencyAmount<TokenWithLogo>
  /** The fee for the bridge operation. Can be a fixed amount in a specific currency or FREE. */
  bridgeFee: CurrencyAmount<TokenWithLogo> | BridgeFeeType
  /** The maximum slippage allowed for the bridge operation, as a percentage string. e.g., "1" for 1% */
  maxBridgeSlippage: string
  /** The estimated time for the bridge transaction to complete, in seconds. */
  estimatedTime: number
  /** The recipient address on the destination chain. */
  recipient: string
  /** The chain ID of the destination chain. */
  recipientChainId: SupportedChainId
  /** The chain ID of the source chain for the bridge operation. */
  sourceChainId: SupportedChainId

  // Bridge provider info
  /** Configuration details of the bridge protocol provider. */
  bridgeProvider: BridgeProtocolConfig
}
