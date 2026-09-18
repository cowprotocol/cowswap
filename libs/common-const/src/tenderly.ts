import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const TENDERLY_AVAILABLE: Record<SupportedChainId, boolean> = {
  ...mapSupportedNetworks(true),
  // Tenderly simulates EVM transactions only; the Batch and Graph views live off its traces.
  [SupportedChainId.SOLANA]: false,
}
