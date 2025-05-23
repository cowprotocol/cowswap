import { SupportedChainId } from '@cowprotocol/cow-sdk'

export enum BridgeStatus {
  Pending = 'pending', // Bridge operation initiated but not yet active
  InProgress = 'inProgress', // Actively bridging
  Completed = 'completed', // Bridge operation successful
  Failed = 'failed', // Bridge operation failed
  Refunding = 'refunding', // Bridge failed, and refund process is active
  RefundComplete = 'refundComplete', // Refund process finished
  Unknown = 'unknown', // Status cannot be determined
}

export interface BridgeableToken {
  address: string
  chainId: SupportedChainId
  symbol?: string // Optional, for display
  decimals?: number // Optional, for display or amount calculations
}

export interface BridgeDetails {
  providerName: string // e.g., "Bungee"
  isSuccess: boolean // Overall success derived from status
  status: BridgeStatus // Our lifecycle status
  bridgeQuoteTimestamp?: number // From SDK: BridgeQuoteResult.quoteTimestamp
  expectedFillTimeSeconds?: number // From SDK: BridgeQuoteResult.expectedFillTimeSeconds

  source: BridgeableToken
  destination: BridgeableToken

  inputAmount: string // Amount of sourceToken effectively sent into the bridge
  outputAmount?: string // Amount of destinationToken expected/received from the bridge

  gasCostsNative?: string // Gas costs on the source chain for the bridge approval/initiation, in native currency of source chain
  protocolFeeSellToken?: string // Protocol fees taken in the sell (source) token of the bridge
  protocolFeeBuyToken?: string // Protocol fees taken in the buy (destination) token of the bridge

  maxSlippageBps?: number // From SDK: BridgeQuoteResult.slippageBps

  sourceChainTransactionHash?: string // Optional: if the bridge involves a tx on source chain initiated by user/SDK
  destinationChainTransactionHash?: string // Hash of the bridging transaction on the destination chain

  explorerUrl?: string // Link to the bridge provider's explorer for this specific transaction

  minDepositAmount?: string // Derived from SDK: BridgeQuoteResult.limits.minDeposit
  maxDepositAmount?: string // Derived from SDK: BridgeQuoteResult.limits.maxDeposit
}

// Example of how it might be added to an Order-like structure
// This is just for illustration here, the actual Order type will be augmented elsewhere or handled by composition.
/*
export interface OrderWithBridgeDetails extends Order { // Assuming Order is an existing type
  bridgeDetails?: BridgeDetails;
}
*/
