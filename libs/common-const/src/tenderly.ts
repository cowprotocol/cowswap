import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const TENDERLY_AVAILABLE: Record<SupportedChainId, boolean> = {
  ...mapSupportedNetworks(true),
  [SupportedChainId.LENS]: false, // Lens is not fully supported by Tenderly ATM (2025-08)
  [SupportedChainId.PLASMA]: false, // Plasma is not fully supported by Tenderly ATM (2025-11)
}
