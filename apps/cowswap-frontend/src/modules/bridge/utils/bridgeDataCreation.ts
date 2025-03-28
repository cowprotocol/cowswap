import { COW, USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BridgeData, BridgeProtocolConfig } from '../types'

/**
 * Factory function to create bridge data with default values
 * @param overrides - Partial bridge data to override defaults
 * @returns Bridge data with defaults and overrides
 */
export function createBridgeData(
  overrides: Partial<BridgeData> & { bridgeProvider: BridgeProtocolConfig },
): BridgeData {
  const sourceChainId = SupportedChainId.MAINNET
  const recipientChainId = SupportedChainId.ARBITRUM_ONE

  // TODO(bridge): Get token instances for the source chain
  const usdcToken = USDC[sourceChainId]
  const cowToken = COW[sourceChainId]

  // TODO(bridge): These are temporary DEMO values. In the final implementation, these values should be:
  // - Chain IDs: Dynamic selection based on user preferences
  // - Swap details: User input and actual price quotes from API
  // - Network costs: Dynamically calculated based on current gas prices
  // - Slippage settings: User-configured or default app settings
  // - Bridge details: Fetched from bridge provider API
  // - Recipient: Connected wallet address or user-specified recipient
  const baseData = {
    // Default swap details
    sellAmount: '1000',
    sellToken: 'USDC',
    sellTokenAddress: usdcToken.address,
    buyAmount: '3442.423',
    buyToken: 'COW',
    buyTokenAddress: cowToken.address,
    networkCost: '5.60',
    networkCostUsd: '5.58',
    swapMinReceive: '3421.1293',
    swapExpectedToReceive: '3438.321',
    swapMaxSlippage: '0.5',

    // Default bridge details
    bridgeAmount: '3442.423',
    bridgeToken: 'COW',
    bridgeTokenAddress: cowToken.address,
    bridgeTokenReceiveAddress: cowToken.address,
    bridgeReceiveAmount: '3433.1',
    bridgeFee: '0.70',
    maxBridgeSlippage: '0.5',
    estimatedTime: 15,
    recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    recipientChainId,
    sourceChainId,
  }

  // Combine base data with overrides (which must include bridgeProvider)
  return {
    ...baseData,
    ...overrides,
  } as BridgeData
}
