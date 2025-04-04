import { COW, USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BridgeData, BridgeProtocolConfig } from '../types'

// --- Default Demo Values ---
// TODO(bridge): These are temporary DEMO values. In the final implementation, these values should be:
// - Chain IDs: Dynamic selection based on user preferences
// - Swap details: User input and actual price quotes from API
// - Network costs: Dynamically calculated based on current gas prices
// - Slippage settings: User-configured or default app settings
// - Bridge details: Fetched from bridge provider API
// - Recipient: Connected wallet address or user-specified recipient

const DEMO_SOURCE_CHAIN_ID = SupportedChainId.MAINNET
const DEMO_RECIPIENT_CHAIN_ID = SupportedChainId.ARBITRUM_ONE

// TODO(bridge): Get token instances for the source chain instead of hardcoding addresses
const DEMO_USDC_TOKEN_ADDRESS = USDC[DEMO_SOURCE_CHAIN_ID].address
const DEMO_COW_TOKEN_ADDRESS = COW[DEMO_SOURCE_CHAIN_ID].address

const DEMO_BRIDGE_DATA = {
  // Default swap details
  sellAmount: '1000',
  sellToken: 'USDC',
  sellTokenAddress: DEMO_USDC_TOKEN_ADDRESS,
  buyAmount: '3442.423',
  buyToken: 'COW',
  buyTokenAddress: DEMO_COW_TOKEN_ADDRESS,
  networkCost: '5.60',
  networkCostUsd: '5.58',
  swapMinReceive: '3421.1293',
  swapExpectedToReceive: '3438.321',
  swapMaxSlippage: '0.5',

  // Default bridge details
  bridgeAmount: '3438.321',
  bridgeToken: 'COW',
  bridgeTokenAddress: DEMO_COW_TOKEN_ADDRESS,
  bridgeTokenReceiveAddress: DEMO_COW_TOKEN_ADDRESS, // Assuming same token on destination for demo
  bridgeReceiveAmount: '3433.1',
  bridgeFee: '0.70',
  maxBridgeSlippage: '0.5',
  estimatedTime: 15,
  recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  recipientChainId: DEMO_RECIPIENT_CHAIN_ID,
  sourceChainId: DEMO_SOURCE_CHAIN_ID,
} as const

// --- End Default Demo Values ---

/**
 * Factory function to create bridge data, merging overrides with demo defaults.
 * Primarily intended for testing/demo purposes until dynamic data loading is implemented.
 * @param overrides - Partial bridge data to override defaults. MUST include bridgeProvider.
 * @returns Bridge data with defaults and overrides
 */
export function createBridgeData(
  overrides: Partial<BridgeData> & { bridgeProvider: BridgeProtocolConfig },
): BridgeData {
  // Combine demo base data with provided overrides (which must include bridgeProvider)
  return {
    ...DEMO_BRIDGE_DATA,
    ...overrides,
  } as BridgeData // Cast is necessary because overrides are partial
}
