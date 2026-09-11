import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const TENDERLY_AVAILABLE: Record<SupportedChainId, boolean> = {
  ...mapSupportedNetworks(true),
  // Tenderly simulates EVM transactions and has nothing to say about a Solana signature. The Batch
  // and Graph views are built from its traces, so they go with it.
  [SupportedChainId.SOLANA]: false,
}
